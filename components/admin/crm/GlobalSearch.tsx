'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Search, X, Users, UserCheck, Briefcase, DollarSign, Loader2 } from 'lucide-react'
import { searchCrm, SearchResults } from '@/lib/crm-api'
import StatusBadge from './StatusBadge'
import SourceTag from './SourceTag'

interface GlobalSearchProps {
  onSelectLead?: (leadId: string) => void
  onSelectClient?: (clientId: string) => void
  onSelectDeal?: (dealId: string) => void
}

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}

export default function GlobalSearch({
  onSelectLead,
  onSelectClient,
  onSelectDeal,
}: GlobalSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResults | null>(null)
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [focusedIndex, setFocusedIndex] = useState(-1)

  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const debouncedQuery = useDebounce(query, 300)

  // Search when debounced query changes
  useEffect(() => {
    const doSearch = async () => {
      if (debouncedQuery.length < 2) {
        setResults(null)
        return
      }

      try {
        setLoading(true)
        const data = await searchCrm(debouncedQuery)
        setResults(data)
        setIsOpen(true)
      } catch (e) {
        console.error('Search failed:', e)
      } finally {
        setLoading(false)
      }
    }

    doSearch()
  }, [debouncedQuery])

  // Handle keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
        setIsOpen(true)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Get all results as flat array for keyboard navigation
  const allResults = results
    ? [
        ...results.leads.map((l) => ({ type: 'lead' as const, data: l })),
        ...results.clients.map((c) => ({ type: 'client' as const, data: c })),
        ...results.deals.map((d) => ({ type: 'deal' as const, data: d })),
      ]
    : []

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || allResults.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setFocusedIndex((prev) => (prev < allResults.length - 1 ? prev + 1 : 0))
        break
      case 'ArrowUp':
        e.preventDefault()
        setFocusedIndex((prev) => (prev > 0 ? prev - 1 : allResults.length - 1))
        break
      case 'Enter':
        e.preventDefault()
        if (focusedIndex >= 0 && focusedIndex < allResults.length) {
          handleSelect(allResults[focusedIndex])
        }
        break
      case 'Escape':
        setIsOpen(false)
        setFocusedIndex(-1)
        break
    }
  }

  const handleSelect = (item: typeof allResults[0]) => {
    setIsOpen(false)
    setQuery('')
    setFocusedIndex(-1)

    switch (item.type) {
      case 'lead':
        onSelectLead?.(item.data._id)
        break
      case 'client':
        onSelectClient?.(item.data._id)
        break
      case 'deal':
        onSelectDeal?.(item.data._id)
        break
    }
  }

  const handleClear = () => {
    setQuery('')
    setResults(null)
    setIsOpen(false)
    setFocusedIndex(-1)
    inputRef.current?.focus()
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search CRM... (⌘K)"
          className="w-full pl-9 pr-8 py-2 bg-slate-800 border border-slate-700 text-white placeholder-gray-400 rounded-lg text-sm focus:ring-2 focus:ring-[#fe5557] focus:border-transparent transition-colors"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
        )}
        {!loading && query && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Results Dropdown */}
      {isOpen && results && results.total > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-50 max-h-96 overflow-y-auto">
          {/* Leads */}
          {results.leads.length > 0 && (
            <div>
              <div className="px-3 py-2 bg-gray-50 border-b border-gray-100">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  Leads
                </span>
              </div>
              {results.leads.map((lead, index) => (
                <div
                  key={lead._id}
                  onClick={() => handleSelect({ type: 'lead', data: lead })}
                  className={`px-3 py-2 cursor-pointer transition-colors ${
                    focusedIndex === index ? 'bg-gray-100' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm truncate">
                        {lead.fullName}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <SourceTag origin={lead.origin} size="sm" />
                        {lead.serviceType && (
                          <span className="text-xs text-gray-500">{lead.serviceType}</span>
                        )}
                      </div>
                    </div>
                    <StatusBadge status={lead.status} size="sm" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Clients */}
          {results.clients.length > 0 && (
            <div>
              <div className="px-3 py-2 bg-gray-50 border-b border-gray-100 border-t">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1">
                  <UserCheck className="w-3 h-3" />
                  Clients
                </span>
              </div>
              {results.clients.map((client, index) => {
                const resultIndex = results.leads.length + index
                return (
                  <div
                    key={client._id}
                    onClick={() => handleSelect({ type: 'client', data: client })}
                    className={`px-3 py-2 cursor-pointer transition-colors ${
                      focusedIndex === resultIndex ? 'bg-gray-100' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm truncate">
                          {client.fullName}
                        </p>
                        <p className="text-xs text-gray-500">{client.email || client.phone}</p>
                      </div>
                      <span className="text-xs text-gray-500">
                        {client.dealCount} project{client.dealCount !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Deals */}
          {results.deals.length > 0 && (
            <div>
              <div className="px-3 py-2 bg-gray-50 border-b border-gray-100 border-t">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1">
                  <Briefcase className="w-3 h-3" />
                  Projects
                </span>
              </div>
              {results.deals.map((deal, index) => {
                const resultIndex = results.leads.length + results.clients.length + index
                return (
                  <div
                    key={deal._id}
                    onClick={() => handleSelect({ type: 'deal', data: deal })}
                    className={`px-3 py-2 cursor-pointer transition-colors ${
                      focusedIndex === resultIndex ? 'bg-gray-100' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm truncate">
                          {deal.title}
                        </p>
                        <p className="text-xs text-gray-500">{deal.clientName}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {deal.value && (
                          <span className="text-xs text-gray-500 flex items-center gap-0.5">
                            <DollarSign className="w-3 h-3" />
                            {deal.value.toLocaleString()}
                          </span>
                        )}
                        <StatusBadge status={deal.status} size="sm" />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Footer */}
          <div className="px-3 py-2 bg-gray-50 border-t border-gray-100 text-xs text-gray-400">
            <span className="flex items-center justify-between">
              <span>↑↓ Navigate</span>
              <span>↵ Select</span>
              <span>Esc Close</span>
            </span>
          </div>
        </div>
      )}

      {/* No Results */}
      {isOpen && results && results.total === 0 && query.length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 p-4 z-50">
          <p className="text-sm text-gray-500 text-center">
            No results for &ldquo;{query}&rdquo;
          </p>
        </div>
      )}
    </div>
  )
}
