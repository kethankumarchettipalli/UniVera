import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { X, Loader2 } from 'lucide-react';
import { PG } from '../../types';
import { addPg } from '../../config/firebase';
import toast from 'react-hot-toast';

interface AddPgFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

type FormData = Omit<PG, 'id' | 'food_type' | 'amenities' | 'images' | 'distance_from_colleges' | 'contact'> & {
  food_type: string;
  amenities: string;
  images: string;
  distance_from_colleges: string;
  contact: string;
};

const AddPgForm: React.FC<AddPgFormProps> = ({ onClose, onSuccess }) => {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      const newPg: Omit<PG, 'id'> = {
        name: data.name,
        type: data.type,
        location: data.location,
        rent: Number(data.rent),
        security_deposit: Number(data.security_deposit),
        gender: data.gender,
        rating: Number(data.rating),
        available_rooms: Number(data.available_rooms),
        food_type: data.food_type.split(',').map(item => item.trim()),
        amenities: data.amenities.split(',').map(item => item.trim()),
        images: data.images.split(',').map(item => item.trim()),
        distance_from_colleges: JSON.parse(data.distance_from_colleges),
        contact: JSON.parse(data.contact),
      };
      await addPg(newPg);
      toast.success('Accommodation added successfully!');
      onSuccess();
    } catch (error) {
      console.error(error);
      toast.error('Failed to add accommodation. Please check your data format.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit(onSubmit)} className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Add New Accommodation</h2>
            <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input {...register('name', { required: true })} placeholder="PG/Hostel Name" className="p-2 border rounded" />
              <input {...register('location', { required: true })} placeholder="Location (Area, City)" className="p-2 border rounded" />
              <select {...register('type', { required: true })} className="p-2 border rounded">
                <option value="PG">PG</option>
                <option value="Hostel">Hostel</option>
                <option value="Apartment">Apartment</option>
              </select>
              <select {...register('gender', { required: true })} className="p-2 border rounded">
                <option value="Boys">Boys</option>
                <option value="Girls">Girls</option>
                <option value="Co-ed">Co-ed</option>
              </select>
              <input type="number" {...register('rent', { required: true })} placeholder="Monthly Rent (₹)" className="p-2 border rounded" />
              <input type="number" {...register('security_deposit', { required: true })} placeholder="Security Deposit (₹)" className="p-2 border rounded" />
              <input type="number" step="0.1" {...register('rating', { required: true, min: 0, max: 5 })} placeholder="Rating (0-5)" className="p-2 border rounded" />
              <input type="number" {...register('available_rooms', { required: true })} placeholder="Available Rooms" className="p-2 border rounded" />
            </div>

            <div>
              <label className="font-semibold">Images (comma-separated URLs)</label>
              <input {...register('images', { required: true })} placeholder="url1, url2, url3" className="w-full p-2 border rounded" />
            </div>
            <div>
              <label className="font-semibold">Food Types (comma-separated)</label>
              <input {...register('food_type', { required: true })} placeholder="Vegetarian, North Indian" className="w-full p-2 border rounded" />
            </div>
            <div>
              <label className="font-semibold">Amenities (comma-separated)</label>
              <input {...register('amenities', { required: true })} placeholder="WiFi, AC, Laundry" className="w-full p-2 border rounded" />
            </div>
            
            <div>
              <label className="font-semibold">Contact (JSON format)</label>
              <textarea {...register('contact', { required: true })} rows={3} className="w-full p-2 border rounded font-mono text-sm" placeholder='{"phone": "+91...", "email": "..."}' />
            </div>
            <div>
              <label className="font-semibold">Distance from Colleges (JSON format)</label>
              <textarea {...register('distance_from_colleges', { required: true })} rows={4} className="w-full p-2 border rounded font-mono text-sm" placeholder='[{"college_name": "IIT Delhi", "distance": "2.5 km"}]' />
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <button type="submit" disabled={isLoading} className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 disabled:opacity-50 flex items-center">
              {isLoading && <Loader2 className="animate-spin h-4 w-4 mr-2" />}
              {isLoading ? 'Saving...' : 'Save Accommodation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPgForm;