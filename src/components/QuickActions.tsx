// src/components/QuickActions.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { Building, Heart } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import toast from "react-hot-toast";
import type { College } from "../types";

type Props = {
  college: College;
};

const QuickActions: React.FC<Props> = ({ college }) => {
  const navigate = useNavigate();
  const { user, userProfile, toggleFavorite } = useAuth();

  // derive favorite status directly from userProfile
  const isFavorited = userProfile?.favorites?.colleges?.includes(college.id);

  const handleCompare = () => {
    navigate("/compare", { state: { preselectCollegeIds: [college.id] } });
  };

  const handleSaveFavorite = async (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();

    if (!user) {
      toast.error("You must be signed in to save favorites.");
      return;
    }

    await toggleFavorite("colleges", college.id);
  };

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <h4 className="text-lg font-semibold mb-4">Quick Actions</h4>

      <div className="space-y-3">
        {/* Compare button */}
        <button
          onClick={handleCompare}
          className="w-full px-4 py-3 rounded-lg bg-emerald-600 text-white font-semibold hover:scale-[1.01] transition"
          aria-label="Compare college"
        >
          <span className="flex items-center justify-center gap-2">
            <Building className="h-4 w-4" />
            Compare College
          </span>
        </button>

        {/* Save to favorites (toggle) */}
        <button
          onClick={handleSaveFavorite}
          className={`w-full px-4 py-3 rounded-lg border-2 font-semibold transition
            ${
              isFavorited
                ? "border-rose-500 text-rose-600 bg-rose-50"
                : "border-amber-400 text-amber-600 hover:bg-amber-50"
            }`}
          aria-label="Save to favorites"
          aria-pressed={!!isFavorited}
          title={isFavorited ? "Remove from favorites" : "Save to favorites"}
        >
          <span className="flex items-center justify-center gap-2">
            <Heart className="h-4 w-4" />
            {isFavorited ? "♥ Saved" : "♡ Save to Favorites"}
          </span>
        </button>
      </div>
    </div>
  );
};

export default QuickActions;
