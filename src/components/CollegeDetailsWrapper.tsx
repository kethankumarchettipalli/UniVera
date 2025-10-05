// src/components/CollegeDetailsWrapper.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CollegeDetails from './CollegeDetails';
import { getColleges } from '../config/firebase';
import { College } from '../types';

const CollegeDetailsWrapper: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [college, setCollege] = useState<College | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchCollege = async () => {
      if (!id) {
        setErr('No college id provided');
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        // fallback: fetch all and find the match (works for your current helpers)
        const all = await getColleges();
        if (!mounted) return;
        const found = all.find(c => c.id === id);
        if (found) setCollege(found);
        else setErr('College not found');
      } catch (e: any) {
        console.error('Failed to fetch college by id', e);
        if (mounted) setErr(e?.message ?? 'Failed to load college');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchCollege();
    return () => { mounted = false; };
  }, [id]);

  if (loading) return <div className="p-8 text-center">Loading college details…</div>;
  if (err) return <div className="p-8 text-center text-red-600">Error: {err}</div>;
  if (!college) return <div className="p-8 text-center">College not found.</div>;

  return <CollegeDetails college={college} onBack={() => navigate(-1)} />;
};

export default CollegeDetailsWrapper;
