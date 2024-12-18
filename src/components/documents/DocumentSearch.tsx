import React from 'react';
import { Search } from 'lucide-react';
import { DocumentSearchFilters } from './DocumentSearchFilters';
import { useDebounce } from '../../hooks/useDebounce';
import { useDocumentSearch } from '../../hooks/useDocumentSearch';
import type { Document } from '../../types';

interface DocumentSearchProps {
  onSearchStart: () => void;
  onSearchComplete: (documents: Document[]) => void;
  onError: (error: Error) => void;
}

export function DocumentSearch({ onSearchStart, onSearchComplete, onError }: DocumentSearchProps) {
  return null;
}