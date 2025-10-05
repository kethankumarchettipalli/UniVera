import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { X, Loader2 } from 'lucide-react';
import { College } from '../../types';
import { addCollege } from '../../config/firebase';
import toast from 'react-hot-toast';

interface AddCollegeFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

type FormData = Omit<College, 'id' | 'branches' | 'infrastructure' | 'placements' | 'facilities'> & {
  branches: string;
  infrastructure: string;
  placements: string;
  facilities: string;
};

const AddCollegeForm: React.FC<AddCollegeFormProps> = ({ onClose, onSuccess }) => {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data: FormData) => {
  setIsLoading(true);
  try {
    // parse JSON blocks safely
    let branchesParsed;
    let infraParsed;
    let placementsParsed;

    try {
      branchesParsed = JSON.parse(data.branches);
      if (!Array.isArray(branchesParsed)) {
        toast.error('Branches should be a JSON array (e.g. [{"name":"CSE", ...}])');
        setIsLoading(false);
        return;
      }
    } catch (e) {
      toast.error('Invalid JSON in Branches field.');
      setIsLoading(false);
      return;
    }

    try {
      infraParsed = JSON.parse(data.infrastructure);
    } catch (e) {
      toast.error('Invalid JSON in Infrastructure field.');
      setIsLoading(false);
      return;
    }

    try {
      placementsParsed = JSON.parse(data.placements);
    } catch (e) {
      toast.error('Invalid JSON in Placements field.');
      setIsLoading(false);
      return;
    }

    // Build payload using only defined values
    const raw: Record<string, any> = {
      name: data.name?.trim() ?? null,
      location: data.location?.trim() ?? null,
      state: data.state?.trim() ?? null,
      type: data.type ?? null,
      rating: data.rating !== undefined && data.rating !== '' ? Number(data.rating) : null,
      image: data.image?.trim() ?? null,
      established: data.established !== undefined && data.established !== '' ? Number(data.established) : null,
      affiliation: data.affiliation?.trim() ?? null,
      // set nirf to null when empty — DO NOT set undefined
      nirf_ranking: data.nirf_ranking !== undefined && data.nirf_ranking !== '' ? Number(data.nirf_ranking) : null,
      branches: branchesParsed,
      infrastructure: infraParsed,
      placements: placementsParsed,
      facilities: data.facilities ? data.facilities.split(',').map(item => item.trim()).filter(Boolean) : [],
    };

    // Optionally remove keys that are null if you prefer them omitted entirely:
    const sanitized: Record<string, any> = {};
    Object.entries(raw).forEach(([k, v]) => {
      // keep null or remove nulls depending on your schema preference
      // If you want to omit nulls, use: if (v !== null) sanitized[k] = v;
      // Here we'll keep nulls (safe for Firestore) except undefined (shouldn't exist)
      if (v !== undefined) sanitized[k] = v;
    });

    console.log('Sanitized college payload:', sanitized);

    // call your addCollege util (ensure it calls Firestore addDoc with sanitized)
    await addCollege(sanitized as Omit<College, 'id'>);

    toast.success('College added successfully!');
    onSuccess();
  } catch (error) {
    console.error(error);
    toast.error('Failed to add college. Please check your data format.');
  } finally {
    setIsLoading(false);
  }
};


  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit(onSubmit)} className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Add New College</h2>
            <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <div className="space-y-4">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input {...register('name', { required: true })} placeholder="College Name" className="p-2 border rounded" />
              <input {...register('location', { required: true })} placeholder="Location (City)" className="p-2 border rounded" />
              <input {...register('state', { required: true })} placeholder="State" className="p-2 border rounded" />
              <select {...register('type', { required: true })} className="p-2 border rounded">
                <option value="Government">Government</option>
                <option value="Private">Private</option>
                <option value="Deemed">Deemed</option>
              </select>
              <input type="number" step="0.1" {...register('rating', { required: true, min: 0, max: 5 })} placeholder="Rating (0-5)" className="p-2 border rounded" />
              <input {...register('image', { required: true })} placeholder="Image URL" className="p-2 border rounded" />
              <input type="number" {...register('established', { required: true })} placeholder="Year Established" className="p-2 border rounded" />
              <input {...register('affiliation', { required: true })} placeholder="Affiliation" className="p-2 border rounded" />
              <input type="number" {...register('nirf_ranking')} placeholder="NIRF Ranking (Optional)" className="p-2 border rounded" />
            </div>

            {/* Complex JSON Fields */}
            <div>
              <label className="font-semibold">Branches (JSON format)</label>
              <textarea {...register('branches', { required: true })} rows={5} className="w-full p-2 border rounded font-mono text-sm" placeholder='[{"name": "CSE", "category": "Engineering", ...}]' />
            </div>
            <div>
              <label className="font-semibold">Infrastructure (JSON format)</label>
              <textarea {...register('infrastructure', { required: true })} rows={5} className="w-full p-2 border rounded font-mono text-sm" placeholder='{"campus_area": "320 acres", "hostels": {...}, ...}' />
            </div>
            <div>
              <label className="font-semibold">Placements (JSON format)</label>
              <textarea {...register('placements', { required: true })} rows={5} className="w-full p-2 border rounded font-mono text-sm" placeholder='{"percentage": 98, "average_package": 1800000, ...}' />
            </div>

            {/* Comma-separated Fields */}
            <div>
              <label className="font-semibold">Facilities (comma-separated)</label>
              <input {...register('facilities', { required: true })} placeholder="WiFi Campus, Cafeteria, Transport" className="w-full p-2 border rounded" />
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <button type="submit" disabled={isLoading} className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 disabled:opacity-50 flex items-center">
              {isLoading && <Loader2 className="animate-spin h-4 w-4 mr-2" />}
              {isLoading ? 'Saving...' : 'Save College'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCollegeForm;