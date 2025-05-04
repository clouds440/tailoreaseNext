// app/add-dummy-data/page.jsx

'use client';

import { useEffect } from 'react';
import { addDataToFirestore } from '@/utils/addData';

export default function TriggerDataPage() {
  useEffect(() => {
    addDataToFirestore();
  }, []);

  return <div>🔥 Seeding data to Firestore... Check the browser console.</div>;
}
