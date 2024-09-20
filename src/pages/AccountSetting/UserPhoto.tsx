import { Button, Input } from '@headlessui/react';
import { useContext, useState } from 'react';
import { AuthContext } from '../../components/AuthWrapper.tsx';
import UpLoadIcon from '../../images/icon/UpLoadIcon.tsx';
import Cropper, { Area } from 'react-easy-crop';
import getCroppedImg from '../../common/cropImage.ts';
import axios from 'axios';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createToast } from '../../hooks/fireToast.tsx';

export default function UserPhoto() {
  const queryClient = useQueryClient();
  const { user_data, route } = useContext(AuthContext);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState<Area | null>(null);
  const [file, setFile] = useState<string | undefined>(undefined);
  const updatePhoto = useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return axios.post(`${route}/update_user_profile`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    },
    onError: (error) => {
      createToast(
        'Error updating photo',
        error.message,
        3,
        'Error updating photo',
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', route] });
    },
  });
  const deletePhoto = useMutation({
    mutationFn: () => {
      return axios.put(`${route}/delete_user_photo`);
    },
    onError: (error) => {
      createToast(
        'Error deleting photo',
        error.message,
        3,
        'Error deleting photo',
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', route] });
    },
  });
  return (
    <div className="col-span-5 xl:col-span-2">
      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="border-b border-stroke py-4 px-7 dark:border-strokedark">
          <h3 className="font-medium text-black dark:text-white">Your Photo</h3>
        </div>
        <div className="p-7">
          <form>
            <div className="mb-4 flex items-center gap-3">
              <div className="h-14 w-14 rounded-full">
                {user_data.picture ? (
                  <img
                    src={user_data.picture}
                    alt="User"
                    className="rounded-full"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-yellow-200 flex justify-center items-center">
                    {user_data.name.split(' ').map((n) => n.charAt(0))}
                  </div>
                )}
              </div>
              <div>
                <span className="mb-1.5 text-black dark:text-white">
                  Edit your photo
                </span>
                <span className="flex gap-2.5">
                  <button
                    className="text-sm hover:text-primary"
                    onClick={(event) => {
                      event.preventDefault();
                      deletePhoto.mutate();
                    }}
                  >
                    Delete
                  </button>
                </span>
              </div>
            </div>
            {file ? (
              <div className="relative mb-5.5 block h-52 w-full cursor-pointer appearance-none rounded border border-dashed border-primary bg-gray dark:bg-meta-4">
                <Cropper
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  crop={crop}
                  zoom={zoom}
                  image={file}
                  cropShape="round"
                  aspect={1}
                  showGrid={false}
                  onCropComplete={(_croppedArea, croppedAreaPixels) =>
                    setCroppedArea(croppedAreaPixels)
                  }
                />
              </div>
            ) : (
              <div
                id="FileUpload"
                className="relative mb-5.5 block w-full cursor-pointer appearance-none rounded border border-dashed border-primary bg-gray py-4 px-4 dark:bg-meta-4 sm:py-7.5"
              >
                <Input
                  type="file"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file && file.size <= 10485760) {
                      setFile(URL.createObjectURL(file));
                    } else {
                      createToast(
                        'File too large',
                        'Please upload a file less than 10 MB',
                        3,
                        'File too large',
                      );
                    }
                  }}
                  accept="image/*"
                  className="absolute inset-0 z-50 m-0 h-full w-full cursor-pointer p-0 opacity-0 outline-none"
                />
                <div className="flex flex-col items-center justify-center space-y-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full border border-stroke bg-white dark:border-strokedark dark:bg-boxdark">
                    <UpLoadIcon />
                  </span>
                  <p>
                    <span className="text-primary">Click to upload</span> or
                    drag and drop
                  </p>
                  <p className="mt-1.5">SVG, PNG, JPG or GIF</p>
                  <p>Please upload file less than 10 MB</p>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-4.5">
              <Button
                className="flex justify-center rounded border border-stroke py-2 px-6 font-medium text-black hover:shadow-1 dark:border-strokedark dark:text-white"
                onClick={() => {
                  setFile(undefined);
                  setCroppedArea(null);
                  setZoom(1);
                  setCrop({ x: 0, y: 0 });
                }}
              >
                Reset
              </Button>
              <Button
                className="flex justify-center rounded bg-primary py-2 px-6 font-medium text-gray hover:bg-opacity-90"
                onClick={async () => {
                  if (file) {
                    const croppedImage = await getCroppedImg(
                      file,
                      croppedArea,
                      0,
                    );
                    if (croppedImage) {
                      const ImageFile = new File([croppedImage], 'avatar.jpg');
                      updatePhoto.mutate(ImageFile);
                    }
                  }
                }}
              >
                Save
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
