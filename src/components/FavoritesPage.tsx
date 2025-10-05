// src/components/FavoritesPage.tsx
import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  QueryDocumentSnapshot,
  DocumentData,
} from "firebase/firestore";
import { db, auth } from "../config/firebase";
import { useAuth } from "../hooks/useAuth";
import { College, PG } from "../types";
import CollegeCard from "./CollegeCard";
import PGCard from "./PGCard";
import { Heart, BookOpen, Home, Loader2 } from "lucide-react";

interface FavoritesPageProps {
  allColleges: College[];
  allPgs: PG[];
  onCollegeSelect: (college: College) => void;
  onPgSelect: (pg: PG) => void;
  onCompare: (college: College) => void;
}

type FavoriteDoc = {
  collegeId?: string;
  pgId?: string;
  type?: "college" | "pg";
  name?: string;
  createdAt?: any;
};

const FavoritesPage: React.FC<FavoritesPageProps> = ({
  allColleges,
  allPgs,
  onCollegeSelect,
  onPgSelect,
  onCompare,
}) => {
  const { user, userProfile, loading: authLoading } = useAuth();

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // local merged id lists (source: userProfile arrays + legacy subcollection)
  const [mergedCollegeIds, setMergedCollegeIds] = useState<string[]>([]);
  const [mergedPgIds, setMergedPgIds] = useState<string[]>([]);

  useEffect(() => {
    let mounted = true;

    const fetchLegacyFavorites = async (uid: string) => {
      try {
        const favCollRef = collection(db, "users", uid, "favorites");
        const snap = await getDocs(favCollRef);

        const collegeIds: string[] = [];
        const pgIds: string[] = [];

        snap.docs.forEach((docSnap: QueryDocumentSnapshot<DocumentData>) => {
          const data = docSnap.data() as FavoriteDoc;

          // If the doc explicitly states type or id fields, honor it
          if (data.type === "college") {
            if (data.collegeId) collegeIds.push(data.collegeId);
            else if (docSnap.id) {
              // doc id could be a college id — but only include if it exists in master list
              if (allColleges.some((c) => c.id === docSnap.id)) collegeIds.push(docSnap.id);
            }
            return;
          }
          if (data.type === "pg") {
            if (data.pgId) pgIds.push(data.pgId);
            else if (docSnap.id) {
              if (allPgs.some((p) => p.id === docSnap.id)) pgIds.push(docSnap.id);
            }
            return;
          }

          // explicit id fields (preferred)
          if (data.collegeId) {
            collegeIds.push(data.collegeId);
            return;
          }
          if (data.pgId) {
            pgIds.push(data.pgId);
            return;
          }

          // FALLBACK (conservative): only include doc id if it is present in master lists
          // (do NOT assume unknown docs are colleges)
          const docId = docSnap.id;
          const foundInCol = allColleges.some((c) => c.id === docId);
          const foundInPg = allPgs.some((p) => p.id === docId);

          if (foundInCol) collegeIds.push(docId);
          else if (foundInPg) pgIds.push(docId);
          // else -> ignore unknown/ambiguous doc
        });

        return {
          collegeIds: Array.from(new Set(collegeIds)),
          pgIds: Array.from(new Set(pgIds)),
        };
      } catch (err) {
        console.error("[FavoritesPage] fetchLegacyFavorites error:", err);
        return { collegeIds: [], pgIds: [] };
      }
    };

    const buildMergedList = async () => {
      setLoading(true);
      setError(null);

      try {
        // canonical arrays from userProfile (may be undefined)
        const profileCollegeIds: string[] = userProfile?.favorites?.colleges || [];
        const profilePgIds: string[] = userProfile?.favorites?.pgs || [];

        let legacyCollegeIds: string[] = [];
        let legacyPgIds: string[] = [];

        // If there is a logged-in user, try to fetch legacy subcollection (best-effort)
        if (auth.currentUser) {
          const legacy = await fetchLegacyFavorites(auth.currentUser.uid);
          legacyCollegeIds = legacy.collegeIds;
          legacyPgIds = legacy.pgIds;
        }

        // Merge but favor userProfile values first (they are canonical)
        const mergedCols = Array.from(new Set([...profileCollegeIds, ...legacyCollegeIds]));
        const mergedPgs = Array.from(new Set([...profilePgIds, ...legacyPgIds]));

        if (mounted) {
          setMergedCollegeIds(mergedCols);
          setMergedPgIds(mergedPgs);
        }
      } catch (err) {
        console.error("[FavoritesPage] buildMergedList error:", err);
        if (mounted) setError("Failed to load favorites. See console.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    if (!authLoading) {
      buildMergedList();
    }

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, userProfile, allColleges, allPgs]);

  // Map merged ids to objects from allColleges/allPgs
  const favoriteColleges = mergedCollegeIds
    .map((id) => allColleges.find((c) => c.id === id))
    .filter(Boolean) as College[];

  const favoritePgs = mergedPgIds
    .map((id) => allPgs.find((p) => p.id === id))
    .filter(Boolean) as PG[];

  // Loading indicators
  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-12 w-12 text-saffron-600 animate-spin" />
      </div>
    );
  }

  if (!auth.currentUser && !userProfile) {
    // user not signed in
    return (
      <div className="text-center py-16">
        <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-600 mb-2">Login to see your favorites</h3>
        <p className="text-gray-500">You can save colleges and PGs to view them here later.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-800 mb-4">
            My <span className="text-saffron-600">Favorites</span>
          </h1>
          <p className="text-xl text-gray-600">Your saved colleges and accommodations, all in one place.</p>
        </div>

        {error && <div className="mb-6 text-center text-sm text-rose-600">{error}</div>}

        <section className="mb-12">
          <div className="flex items-center mb-6">
            <BookOpen className="h-8 w-8 text-emerald-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-700">Favorite Colleges ({favoriteColleges.length})</h2>
          </div>

          {favoriteColleges.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {favoriteColleges.map((college) => (
                <CollegeCard key={college.id} college={college} onViewDetails={onCollegeSelect} onCompare={onCompare} />
              ))}
            </div>
          ) : (
            <p className="text-gray-500 pl-12">You haven't saved any colleges yet.</p>
          )}
        </section>

        <section>
          <div className="flex items-center mb-6">
            <Home className="h-8 w-8 text-blue-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-700">Favorite Accommodations ({favoritePgs.length})</h2>
          </div>

          {favoritePgs.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {favoritePgs.map((pg) => (
                <PGCard key={pg.id} pg={pg} onViewDetails={onPgSelect} />
              ))}
            </div>
          ) : (
            <p className="text-gray-500 pl-12">You haven't saved any accommodations yet.</p>
          )}
        </section>
      </div>
    </div>
  );
};

export default FavoritesPage;
