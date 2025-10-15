"use client";

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Filter, Search, X } from 'lucide-react';

interface DebtorFiltersProps {
  onSearch: (term: string) => void;
  onSort: (option: string) => void;
  onRangeChange: (range: [number, number]) => void;
  debtorCount: number;
}

export function DebtorFilters({
  onSearch,
  onSort,
  onRangeChange,
  debtorCount,
}: DebtorFiltersProps) {
  const [min, setMin] = useState('');
  const [max, setMax] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const handleRangeApply = () => {
    onRangeChange([Number(min) || 0, Number(max) || Infinity]);
  };

  const handleClear = () => {
    setSearchTerm('');
    onSearch('');
    setMin('');
    setMax('');
    onRangeChange([0, Infinity]);
  };

  return (
    <div className="p-4 bg-card rounded-lg border shadow-sm mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Filter by alias..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              onSearch(e.target.value);
            }}
          />
        </div>

        <Select defaultValue="debt-desc" onValueChange={onSort}>
          <SelectTrigger>
            <SelectValue placeholder="Sort by..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="debt-desc">Debt: High to Low</SelectItem>
            <SelectItem value="debt-asc">Debt: Low to High</SelectItem>
            <SelectItem value="alias-asc">Alias: A-Z</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex gap-2 items-center">
            <Input
                type="number"
                placeholder="Min debt"
                value={min}
                onChange={(e) => setMin(e.target.value)}
                onBlur={handleRangeApply}
            />
            <span>-</span>
            <Input
                type="number"
                placeholder="Max debt"
                value={max}
                onChange={(e) => setMax(e.target.value)}
                onBlur={handleRangeApply}
            />
        </div>
        
        <Button onClick={handleClear} variant="ghost" className="w-full md:w-auto">
          <X className="h-4 w-4 mr-2" />
          Clear Filters
        </Button>
      </div>
      <p className="text-sm text-muted-foreground mt-4">Showing {debtorCount} debtors.</p>
    </div>
  );
}
