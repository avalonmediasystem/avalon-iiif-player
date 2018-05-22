import mockManifest from '../json/lunchroom-manners';

// Mock API call
export function fetchManifest() {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(mockManifest);
    }, 500);
  });
}
