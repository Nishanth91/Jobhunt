'use client';

import { useRouter } from 'next/navigation';
import JobCard from '@/components/JobCard';

export default function SavedJobsList({ savedJobs }) {
  const router = useRouter();

  const handleUnsave = async (job) => {
    await fetch(`/api/jobs/${job.id}`, { method: 'DELETE' });
    router.refresh();
  };

  return (
    <div className="grid gap-3">
      {savedJobs.map((job) => (
        <JobCard key={job.id} job={job} saved onUnsave={handleUnsave} showATS />
      ))}
    </div>
  );
}
