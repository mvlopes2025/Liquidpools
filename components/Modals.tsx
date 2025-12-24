import React, { useState } from 'react';
import { X, Calendar, Clock } from 'lucide-react';
import { Button, Input } from './UI';
import { TRANSLATIONS } from '../constants';
import { Language } from '../types';

interface ModalBaseProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const ModalBase: React.FC<ModalBaseProps> = ({ title, isOpen, onClose, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
            <X size={20} />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

interface CreatePoolModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (pair: string, amount: number, time: number) => void;
  lang: Language;
}

export const CreatePoolModal: React.FC<CreatePoolModalProps> = ({ isOpen, onClose, onSubmit, lang }) => {
  const t = TRANSLATIONS[lang];
  const [pair, setPair] = useState('');
  const [amount, setAmount] = useState('');
  const [useCustomTime, setUseCustomTime] = useState(false);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let timestamp = Date.now();
    if (useCustomTime && date && time) {
      timestamp = new Date(`${date}T${time}`).getTime();
    }
    onSubmit(pair, parseFloat(amount), timestamp);
    setPair('');
    setAmount('');
    onClose();
  };

  return (
    <ModalBase title={t.newPool} isOpen={isOpen} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input 
          label={t.pair} 
          placeholder={t.pairPlaceholder} 
          value={pair} 
          onChange={e => setPair(e.target.value.toUpperCase())}
          required 
          autoFocus
        />
        <Input 
          label={t.initialInvestment} 
          type="number" 
          placeholder="0.00" 
          step="0.01"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          required 
        />
        
        <div className="flex items-center gap-2 mb-2">
            <input 
                type="checkbox" 
                id="customTime" 
                checked={useCustomTime} 
                onChange={e => setUseCustomTime(e.target.checked)}
                className="rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="customTime" className="text-sm text-slate-600 dark:text-slate-400 select-none cursor-pointer">
                {t.manualTime}
            </label>
        </div>

        {useCustomTime && (
            <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-2">
                <Input type="date" value={date} onChange={e => setDate(e.target.value)} required={useCustomTime} />
                <Input type="time" value={time} onChange={e => setTime(e.target.value)} required={useCustomTime} />
            </div>
        )}

        <div className="flex justify-end gap-3 mt-6">
          <Button type="button" variant="ghost" onClick={onClose}>{t.cancel}</Button>
          <Button type="submit">{t.createPool}</Button>
        </div>
      </form>
    </ModalBase>
  );
};

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (amount: number, time: number) => void;
  lang: Language;
  title: string;
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({ isOpen, onClose, onSubmit, lang, title }) => {
  const t = TRANSLATIONS[lang];
  const [amount, setAmount] = useState('');
  const [useCustomTime, setUseCustomTime] = useState(false);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let timestamp = Date.now();
    if (useCustomTime && date && time) {
      timestamp = new Date(`${date}T${time}`).getTime();
    }
    onSubmit(parseFloat(amount), timestamp);
    setAmount('');
    onClose();
  };

  return (
    <ModalBase title={title} isOpen={isOpen} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input 
          label={t.amount} 
          type="number" 
          placeholder="0.00" 
          step="0.01"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          required 
          autoFocus
        />
        
        <div className="flex items-center gap-2 mb-2">
            <input 
                type="checkbox" 
                id="customTimeTx" 
                checked={useCustomTime} 
                onChange={e => setUseCustomTime(e.target.checked)}
                className="rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="customTimeTx" className="text-sm text-slate-600 dark:text-slate-400 select-none cursor-pointer">
                {t.manualTime}
            </label>
        </div>

        {useCustomTime && (
            <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-2">
                <Input type="date" value={date} onChange={e => setDate(e.target.value)} required={useCustomTime} />
                <Input type="time" value={time} onChange={e => setTime(e.target.value)} required={useCustomTime} />
            </div>
        )}

        <div className="flex justify-end gap-3 mt-6">
          <Button type="button" variant="ghost" onClick={onClose}>{t.cancel}</Button>
          <Button type="submit">{t.save}</Button>
        </div>
      </form>
    </ModalBase>
  );
};