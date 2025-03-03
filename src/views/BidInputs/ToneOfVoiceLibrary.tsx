import React, { useState, useEffect, useRef, useMemo } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuthUser } from 'react-auth-kit';
import { API_URL, HTTP_PREFIX } from '../../helper/Constants.tsx';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Save, Trash2 } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle
} from '@/components/ui/dialog';

const ToneOfVoiceLibrary = () => {
  const [tones, setTones] = useState([]);
  const [newTone, setNewTone] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [toneToDelete, setToneToDelete] = useState(null);

  // Get auth token
  const getAuth = useAuthUser();
  const auth = useMemo(() => getAuth(), [getAuth]);
  const tokenRef = useRef(auth?.token || "default");

  // Fetch existing tones when component mounts
  useEffect(() => {
    fetchTones();
  }, []);

  const fetchTones = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `http${HTTP_PREFIX}://${API_URL}/get_tone_of_voice_library`,
        {
          headers: {
            Authorization: `Bearer ${tokenRef.current}`
          }
        }
      );
      setTones(response.data.tone_of_voice_library || []);
    } catch (err) {
      toast.error('Failed to load tone of voice library. Please try again later.', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true
      });
      console.error('Error fetching tones:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const saveTones = async () => {
    setIsLoading(true);
    try {
      await axios.post(
        `http${HTTP_PREFIX}://${API_URL}/modify_tone_of_voice_library`,
        tones,
        {
          headers: {
            Authorization: `Bearer ${tokenRef.current}`
          }
        }
      );
      toast.success('Tone of voice library updated successfully!', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true
      });
    } catch (err) {
      toast.error('Failed to update tone of voice library. Please try again.', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true
      });
      console.error('Error saving tones:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const addTone = () => {
    if (newTone.trim() === '') return;
    if (tones.includes(newTone.trim())) {
      toast.warning('This tone already exists in your library.', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true
      });
      return;
    }
    
    setTones([...tones, newTone.trim()]);
    setNewTone('');
  };

  const handleNewToneKeyPress = (e) => {
    if (e.key === 'Enter') {
      addTone();
    }
  };

  const removeTone = (index) => {
    const updatedTones = [...tones];
    updatedTones.splice(index, 1);
    setTones(updatedTones);
  };

  const confirmDeleteTone = (index) => {
    setToneToDelete(index);
    setShowConfirmDialog(true);
  };

  const handleConfirmDelete = () => {
    if (toneToDelete !== null) {
      removeTone(toneToDelete);
      toast.info('Tone removed from library.', {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true
      });
    }
    setShowConfirmDialog(false);
    setToneToDelete(null);
  };

  return (
    <>
      <ToastContainer />
      <Card className="w-full shadow-lg">
        <CardHeader className="bg-slate-50 border-b">
          <CardTitle className="text-2xl">Tone of Voice Library</CardTitle>
          <CardDescription>
            Manage your tone of voice options for content creation
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-6">
          <div className="flex mb-6">
            <Input
              placeholder="Add new tone of voice..."
              value={newTone}
              onChange={(e) => setNewTone(e.target.value)}
              onKeyPress={handleNewToneKeyPress}
              className="mr-2"
            />
            <Button onClick={addTone} disabled={isLoading || !newTone.trim()}>
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3">Your Tones</h3>
            {tones.length === 0 ? (
              <p className="text-slate-500 italic">No tones added yet. Add your first tone above.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {tones.map((tone, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary"
                    className="px-3 py-1 text-sm flex items-center gap-2"
                  >
                    {tone}
                    <button 
                      onClick={() => confirmDeleteTone(index)}
                      className="ml-1 text-slate-500 hover:text-red-500 transition-colors"
                      aria-label={`Remove ${tone}`}
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="bg-slate-50 border-t p-4">
          <Button 
            onClick={saveTones} 
            disabled={isLoading}
            className="ml-auto"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </CardFooter>

        {/* Confirmation Dialog */}
        <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogDescription>
                Are you sure you want to remove this tone from your library?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex space-x-2 justify-end">
              <Button 
                variant="outline" 
                onClick={() => setShowConfirmDialog(false)}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleConfirmDelete}
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Card>
    </>
  );
};

export default ToneOfVoiceLibrary;