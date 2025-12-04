/**
 * USDC Deposit Component
 * 
 * User-friendly interface for depositing USDC into Tongo vault
 * Guides users through: bridge setup → approval → deposit
 */

import React, { useState, useEffect } from 'react';
import { Account, RpcProvider } from 'starknet';
import {
  getDepositSteps,
  getUSDCBalance,
  approveUSDCSpending,
  depositToTongo,
  executeCompleteDeposit,
  formatUSDC,
  parseUSDC,
  getSetupInstructions,
  DepositProgress,
  USDCDepositStep,
  waitForTransaction
} from '../usdc-deposit-service';

interface USDCDepositProps {
  account: Account;
  provider: RpcProvider;
  network: 'sepolia' | 'mainnet';
  onDepositComplete?: (amount: bigint, txHash: string) => void;
}

interface DepositState {
  balance: bigint;
  amount: string;
  isLoading: boolean;
  error: string | null;
  progress: DepositProgress | null;
  showSetup: boolean;
}

export const USDCDepositComponent: React.FC<USDCDepositProps> = ({
  account,
  provider,
  network,
  onDepositComplete
}) => {
  const [state, setState] = useState<DepositState>({
    balance: BigInt(0),
    amount: '10',
    isLoading: false,
    error: null,
    progress: null,
    showSetup: false
  });

  // Load balance on mount
  useEffect(() => {
    loadBalance();
    const interval = setInterval(loadBalance, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, [account, provider]);

  const loadBalance = async () => {
    try {
      const balance = await getUSDCBalance(account, provider, network);
      setState(prev => ({
        ...prev,
        balance,
        error: null
      }));
    } catch (error) {
      console.error('[USDC-UI] Error loading balance:', error);
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setState(prev => ({
      ...prev,
      amount: e.target.value
    }));
  };

  const handleMaxClick = () => {
    setState(prev => ({
      ...prev,
      amount: formatUSDC(prev.balance)
    }));
  };

  const handleDeposit = async () => {
    try {
      const amount = parseUSDC(state.amount);

      if (amount <= BigInt(0)) {
        setState(prev => ({
          ...prev,
          error: 'Amount must be greater than 0'
        }));
        return;
      }

      if (amount > state.balance) {
        setState(prev => ({
          ...prev,
          error: 'Insufficient balance'
        }));
        return;
      }

      setState(prev => ({
        ...prev,
        isLoading: true,
        error: null,
        progress: {
          currentStep: 0,
          steps: getDepositSteps()
        }
      }));

      const result = await executeCompleteDeposit(
        account,
        provider,
        amount,
        network,
        (progress) => {
          setState(prev => ({
            ...prev,
            progress
          }));
        }
      );

      if (result.success && result.depositTx) {
        onDepositComplete?.(amount, result.depositTx);
        setState(prev => ({
          ...prev,
          amount: '10',
          isLoading: false
        }));
        await loadBalance();
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: result.error || 'Deposit failed'
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }));
    }
  };

  const renderProgressStep = (step: USDCDepositStep, index: number) => {
    const statusColors = {
      pending: 'bg-gray-100 border-gray-300',
      'in-progress': 'bg-blue-100 border-blue-300 animate-pulse',
      completed: 'bg-green-100 border-green-300',
      failed: 'bg-red-100 border-red-300'
    };

    const statusIcons = {
      pending: '⏳',
      'in-progress': '⏳',
      completed: '✅',
      failed: '❌'
    };

    return (
      <div
        key={index}
        className={`p-4 mb-3 border-l-4 rounded ${statusColors[step.status]}`}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-lg">{statusIcons[step.status]}</span>
              <h4 className="font-semibold text-gray-900">{step.title}</h4>
              <span className="text-xs text-gray-500">({step.timeEstimate})</span>
            </div>
            <p className="text-sm text-gray-700 mt-1">{step.description}</p>
            {step.error && (
              <p className="text-sm text-red-600 mt-2">Error: {step.error}</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
      <h3 className="text-xl font-bold text-gray-900 mb-4">💰 Deposit USDC</h3>

      {/* Balance Card */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 mb-4 border border-blue-200">
        <p className="text-sm text-gray-600">Available Balance</p>
        <p className="text-2xl font-bold text-blue-900">
          {formatUSDC(state.balance)} USDC
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Network: {network === 'sepolia' ? 'Sepolia Testnet' : 'Mainnet'}
        </p>
      </div>

      {/* Setup Instructions */}
      {state.balance === BigInt(0) && !state.showSetup && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <p className="text-sm font-semibold text-yellow-900 mb-2">
            💡 No USDC detected
          </p>
          <p className="text-xs text-yellow-800 mb-3">
            Need to bridge USDC from Ethereum Sepolia first?
          </p>
          <button
            onClick={() => setState(prev => ({ ...prev, showSetup: !prev.showSetup }))}
            className="text-xs font-semibold text-yellow-700 hover:text-yellow-900 underline"
          >
            {state.showSetup ? 'Hide' : 'Show'} Setup Guide
          </button>

          {state.showSetup && (
            <pre className="text-xs bg-white rounded p-3 mt-3 overflow-auto max-h-60 text-gray-700 whitespace-pre-wrap">
              {getSetupInstructions()}
            </pre>
          )}
        </div>
      )}

      {/* Amount Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Deposit Amount
        </label>
        <div className="flex gap-2">
          <input
            type="number"
            value={state.amount}
            onChange={handleAmountChange}
            disabled={state.isLoading}
            placeholder="10"
            min="0"
            step="0.1"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
          />
          <button
            onClick={handleMaxClick}
            disabled={state.isLoading}
            className="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold rounded-lg disabled:opacity-50 text-sm"
          >
            MAX
          </button>
        </div>
      </div>

      {/* Error Message */}
      {state.error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-red-700">⚠️ {state.error}</p>
        </div>
      )}

      {/* Progress Steps */}
      {state.progress && (
        <div className="mb-4 max-h-48 overflow-y-auto">
          <p className="text-sm font-semibold text-gray-700 mb-2">
            Progress ({state.progress.currentStep + 1}/{state.progress.steps.length})
          </p>
          {state.progress.steps.map((step, index) =>
            renderProgressStep(step, index)
          )}
        </div>
      )}

      {/* Action Buttons */}
      <button
        onClick={handleDeposit}
        disabled={
          state.isLoading ||
          state.balance === BigInt(0) ||
          !state.amount ||
          parseFloat(state.amount) <= 0
        }
        className={`w-full py-3 rounded-lg font-semibold text-white transition-all ${
          state.isLoading
            ? 'bg-blue-400 cursor-wait opacity-75'
            : 'bg-blue-600 hover:bg-blue-700 active:scale-95'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {state.isLoading ? '⏳ Processing...' : '💳 Deposit to Tongo'}
      </button>

      {/* Transaction Link */}
      {state.progress?.txHash && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600 mb-1">Transaction Hash</p>
          <a
            href={`https://starkscan.co/tx/${state.progress.txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:underline break-all"
          >
            {state.progress.txHash.slice(0, 20)}...
          </a>
        </div>
      )}

      {/* Info Box */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
        <p className="text-xs text-gray-600">
          ℹ️ <strong>KYC Required:</strong> Complete identity verification before funding
        </p>
      </div>
    </div>
  );
};

export default USDCDepositComponent;
