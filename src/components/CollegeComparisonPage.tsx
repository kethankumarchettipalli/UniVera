// src/components/CollegeComparisonPage.tsx
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Search, Plus, X, Filter, MapPin, Star, Building } from 'lucide-react';
import { getColleges } from '../config/firebase';
import { College } from '../types';
import { useLocation } from 'react-router-dom';

const MAX_COLS = 4;
const MIN_COLS = 2;

const CollegeComparisonPage: React.FC = () => {
  const [colleges, setColleges] = useState<College[]>([]);
  const [isLoadingColleges, setIsLoadingColleges] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [selectedColleges, setSelectedColleges] = useState<College[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const location = useLocation();

  useEffect(() => {
    let mounted = true;
    const fetch = async () => {
      try {
        setIsLoadingColleges(true);
        const docs = await getColleges();
        if (!mounted) return;
        setColleges(Array.isArray(docs) ? docs : []);
      } catch (err: any) {
        console.error(err);
        setLoadError(err?.message || 'Failed to load colleges');
      } finally {
        if (mounted) setIsLoadingColleges(false);
      }
    };
    fetch();
    return () => { mounted = false; };
  }, []);

  // If the compare button navigated here with preselectCollegeIds in location.state,
  // append those colleges (without duplicates) once colleges are loaded.
  useEffect(() => {
    if (!colleges || colleges.length === 0) return;
    const ids = (location.state as any)?.preselectCollegeIds as string[] | undefined;
    if (!ids || ids.length === 0) return;

    const toSelect = colleges.filter(c => ids.includes(c.id)).slice(0, MAX_COLS);
    if (toSelect.length === 0) return;

    setSelectedColleges(prev => {
      const existingIds = new Set(prev.map(p => p.id));
      const appended = [...prev];
      for (const c of toSelect) {
        if (!existingIds.has(c.id) && appended.length < MAX_COLS) appended.push(c);
      }
      return appended;
    });

    // Clear the history state to avoid re-appending when user navigates back/forward.
    try {
      const curState = window.history.state || {};
      // create a shallow copy without our preselectCollegeIds
      const newState = { ...curState };
      if ((newState as any).usr) {
        // some routers put state under .usr — keep it
      }
      // Replace history state (this won't change the displayed URL)
      window.history.replaceState && window.history.replaceState(newState, '');
    } catch (e) {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [colleges, (location.state as any)?.preselectCollegeIds]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!dropdownRef.current) return;
      if (!dropdownRef.current.contains(e.target as Node) && !inputRef.current?.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const availableColleges = useMemo(() => {
    const q = (searchQuery || '').trim().toLowerCase();
    return colleges
      .filter(c => !selectedColleges.some(s => s.id === c.id))
      .filter(c => {
        if (!q) return true;
        return (c.name || '').toLowerCase().includes(q) || (c.location || '').toLowerCase().includes(q) || (c.state || '').toLowerCase().includes(q);
      })
      .slice(0, 50);
  }, [colleges, selectedColleges, searchQuery]);

  const addCollege = (c: College) => {
    if (selectedColleges.length >= MAX_COLS) return;
    setSelectedColleges(prev => [...prev, c]);
    setSearchQuery('');
    setDropdownOpen(false);
    inputRef.current?.blur();
  };

  const removeCollege = (id: string) => setSelectedColleges(prev => prev.filter(p => p.id !== id));
  const clearAll = () => setSelectedColleges([]);

  const format = (v: any) => {
    if (v === null || v === undefined) return '—';
    if (typeof v === 'number') return v;
    if (Array.isArray(v)) return v.length ? v.join(', ') : '—';
    return String(v);
  };

  const allEqual = (vals: any[]) => {
    if (vals.length === 0) return true;
    const first = JSON.stringify(vals[0]);
    return vals.every(v => JSON.stringify(v) === first);
  };

  const branchUnion = useMemo(() => {
    const set = new Set<string>();
    selectedColleges.forEach(c => c.branches?.forEach(b => set.add(b.name || b.category || 'Other')));
    return Array.from(set);
  }, [selectedColleges]);

  if (isLoadingColleges) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading colleges...</div>
      </div>
    );
  }
  if (loadError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white p-6 rounded shadow">
          <h3 className="text-red-600 font-semibold">Error loading colleges</h3>
          <p className="text-sm text-gray-600">{loadError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header + single search */}
        <div className="bg-white rounded-2xl shadow p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-800">Compare <span className="text-saffron-500">Colleges</span></h2>
              <p className="text-gray-500 mt-1">Select colleges to start comparing</p>
            </div>

            <div className="flex-1 max-w-2xl relative" ref={dropdownRef}>
              <div className="relative">
                <Search className="absolute left-4 top-3 text-gray-300" />
                <input
                  ref={inputRef}
                  value={searchQuery}
                  onFocus={() => setDropdownOpen(true)}
                  onChange={(e) => { setSearchQuery(e.target.value); setDropdownOpen(true); }}
                  placeholder="Search colleges, city or state — e.g., 'Bengaluru' or 'Institute of Tech'..."
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-saffron-200 transition"
                />
                <button
                  onClick={() => { setDropdownOpen(d => !d); inputRef.current?.focus(); }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 rounded-full bg-white border"
                  aria-label="Toggle results"
                >
                  <Plus className="h-4 w-4 text-gray-600" />
                </button>
              </div>

              {/* Dropdown */}
              {dropdownOpen && (
                <div className="absolute z-40 left-0 right-0 mt-3 bg-white border rounded-xl shadow-lg overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-2 border-b">
                    <div className="text-sm text-gray-600">Search results</div>
                    <div className="text-xs text-gray-400">{availableColleges.length} results</div>
                  </div>

                  <div className="max-h-72 overflow-y-auto">
                    {availableColleges.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">No colleges found</div>
                    ) : (
                      availableColleges.map(col => (
                        <div key={col.id} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50">
                          <div className="min-w-0">
                            <div className="font-medium text-sm text-gray-800 line-clamp-1">{col.name}</div>
                            <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                              <MapPin className="h-3 w-3 text-gray-400" />
                              <span>{col.location}{col.state ? ', ' + col.state : ''}</span>
                              {typeof col.nirf_ranking === 'number' && <span className="ml-2 text-xs px-2 py-0.5 bg-gray-100 rounded">NIRF #{col.nirf_ranking}</span>}
                            </div>
                          </div>

                          <div className="ml-4 flex items-center gap-2">
                            <div className="text-xs text-gray-500">{col.rating ?? '—'}</div>
                            <button
                              onClick={() => addCollege(col)}
                              className="px-3 py-1 bg-saffron-500 text-white rounded-full text-sm"
                            >
                              Add
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button onClick={() => setFiltersOpen(f => !f)} className="px-4 py-2 border rounded-lg">
                <Filter className="inline-block mr-2" /> Filters
              </button>
              <button onClick={() => clearAll()} className="px-3 py-2 rounded bg-gray-100">Clear</button>
            </div>
          </div>

          {/* Optional small filters area */}
          {filtersOpen && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Put your filter controls here if needed (state, branch, fees) */}
              <div className="p-3 border rounded-lg text-sm text-gray-500">Filters placeholder — add any controls you need</div>
            </div>
          )}
        </div>

        {/* Selected colleges horizontally (cards) */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">Selected Colleges</h3>
            <div className="text-sm text-gray-500">{selectedColleges.length} / {MAX_COLS} selected</div>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-3">
            {selectedColleges.map(col => (
              <div key={col.id} className="min-w-[280px] max-w-[340px] bg-white rounded-xl shadow p-4 flex-shrink-0">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-800 line-clamp-2">{col.name}</h4>
                    <div className="flex items-center text-gray-500 mt-1 text-sm">
                      <MapPin className="h-4 w-4 mr-1" /> {col.location}{col.state ? ', ' + col.state : ''}
                    </div>
                    <div className="flex items-center mt-2">
                      <Star className="h-4 w-4 text-yellow-400 mr-1" />
                      <span className="font-semibold">{col.rating ?? '—'}</span>
                      {typeof col.nirf_ranking === 'number' && <span className="ml-3 text-xs px-2 py-1 bg-gray-100 rounded">NIRF #{col.nirf_ranking}</span>}
                    </div>
                  </div>

                  <div className="ml-2 text-right">
                    <button onClick={() => removeCollege(col.id)} className="p-1 rounded-full bg-gray-100">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-gray-600">
                  <div><span className="font-medium">Type:</span> {col.type}</div>
                  <div><span className="font-medium">Placements:</span> {col.placement ?? '—'}%</div>
                  <div className="col-span-2">
                    <span className="font-medium">Top Facilities:</span> {col.facilities?.slice(0,3).join(', ') || '—'}
                  </div>
                </div>
              </div>
            ))}

            {/* Add empty slots */}
            {Array.from({ length: Math.max(0, MAX_COLS - selectedColleges.length) }).map((_, i) => (
              <div key={'add-' + i} className="min-w-[280px] max-w-[340px] bg-white rounded-xl shadow p-6 flex flex-col items-center justify-center gap-3 text-gray-500 flex-shrink-0">
                <button onClick={() => { setDropdownOpen(true); inputRef.current?.focus(); }} className="flex flex-col items-center">
                  <div className="h-10 w-10 rounded-full border-2 border-dashed flex items-center justify-center text-2xl">+</div>
                  <div className="mt-2 text-sm">Add College</div>
                </button>
                <div className="text-xs text-gray-400">Click to search and add</div>
              </div>
            ))}
          </div>
        </div>

        {/* Deep comparison table */}
        <div className="bg-white rounded-2xl shadow p-6">
          {selectedColleges.length < MIN_COLS ? (
            <div className="text-center p-12 text-gray-500">
              <Building className="mx-auto mb-4 text-gray-300" />
              Select at least {MIN_COLS} colleges to compare in depth
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr>
                    <th className="text-left sticky left-0 bg-white z-20 p-4">Attribute</th>
                    {selectedColleges.map(c => <th key={c.id} className="p-4 text-center">{c.name}</th>)}
                  </tr>
                </thead>

                <tbody>
                  {[ 
                    { key: 'type', label: 'Type', getter: (c: College) => c.type },
                    { key: 'location', label: 'City / State', getter: (c: College) => `${c.location ?? ''}${c.state ? ', ' + c.state : ''}` },
                    { key: 'affiliation', label: 'Affiliation', getter: (c: College) => c.affiliation },
                    { key: 'established', label: 'Established', getter: (c: College) => c.established },
                    { key: 'rating', label: 'Overall Rating', getter: (c: College) => c.rating },
                    { key: 'nirf', label: 'NIRF Ranking', getter: (c: College) => c.nirf_ranking },
                    { key: 'placement', label: 'Placement %', getter: (c: College) => c.placement },
                    { key: 'contact', label: 'Contact / Email', getter: (c: College) => [c.contact, c.email, c.phone].filter(Boolean).join(' / ') },
                    { key: 'facilities', label: 'Facilities', getter: (c: College) => c.facilities ?? [] },
                  ].map(row => {
                    const vals = selectedColleges.map(c => row.getter(c));
                    const same = allEqual(vals);
                    return (
                      <tr key={row.key} className={`border-t ${!same ? 'bg-yellow-50' : ''}`}>
                        <td className="p-4 font-medium sticky left-0 bg-white z-10">{row.label}</td>
                        {vals.map((v, idx) => <td key={idx} className="p-4 text-center text-sm">{format(v)}</td>)}
                      </tr>
                    );
                  })}

                  <tr className="border-t bg-gray-50">
                    <td className="p-4 font-semibold sticky left-0 bg-white z-10">Branches & Fees (annual)</td>
                    {selectedColleges.map((c) => <td key={c.id} className="p-4 text-center text-sm">{c.branches?.map(b => `${b.name || b.category}: ${b.fees?.annual ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits:0 }).format(b.fees.annual) : '—'}`).join(' / ') || '—'}</td>)}
                  </tr>

                  {branchUnion.length > 0 && (
                    <tr className="border-t">
                      <td className="p-4 font-medium sticky left-0 bg-white z-10">Branch presence</td>
                      {selectedColleges.map(c => <td key={c.id} className="p-4 text-center">{c.branches?.map(b => b.name || b.category).join(', ') || '—'}</td>)}
                    </tr>
                  )}

                  <tr className="border-t">
                    <td className="p-4 font-medium sticky left-0 bg-white z-10">Top Facilities</td>
                    {selectedColleges.map(c => <td key={c.id} className="p-4 text-center">{(c.facilities || []).slice(0,5).join(', ') || '—'}</td>)}
                  </tr>

                  <tr className="border-t">
                    <td className="p-4 font-medium sticky left-0 bg-white z-10">Average Fees (example)</td>
                    {selectedColleges.map(c => {
                      const fees = (c.branches || []).map(b => b.fees?.annual ?? 0).filter(n => n>0);
                      const avg = fees.length ? Math.round(fees.reduce((a,b)=>a+b,0)/fees.length) : null;
                      return <td key={c.id} className="p-4 text-center">{avg ? new Intl.NumberFormat('en-IN', { style:'currency', currency:'INR', maximumFractionDigits:0 }).format(avg) : '—'}</td>;
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CollegeComparisonPage;
