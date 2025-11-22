'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import DealerTopbar from './dealer-topbar';
import { get } from '@/lib/api';

interface DealerData {
  credits: number;
  dealerId: number;
}

interface DealerProfileData {
  id: number;
  email: string;
  username: string;
  dealer: {
    name: string;
    contactEmail: string;
    dealerTierCredits?: Array<{
      tier: {
        id: number;
        name: string;
      };
    }>;
  };
}

const DealerTopbarWrapper = () => {
  const pathname = usePathname();
  const [credits, setCredits] = useState<number>(0);
  const [tierName, setTierName] = useState<string>('');
  const [dealerName, setDealerName] = useState<string>('');
  const [dealerEmail, setDealerEmail] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Routes where topbar should be hidden
  const excludedRoutes = [
    '/dealer',
    '/dealer/profile',
    '/dealer/profiles',
    '/dealer/select-profile',
  ];

  const shouldShowTopbar = !excludedRoutes.includes(pathname);

  useEffect(() => {
    if (!shouldShowTopbar) return;

    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch credits
        const creditsResponse = await fetch('/api/dealers/credits', {
          credentials: 'include',
        });
        if (creditsResponse.ok) {
          const creditsData: DealerData = await creditsResponse.json();
          setCredits(creditsData.credits);
        }

        // Fetch profile info using the same method as profile page
        const profileData = await get<DealerProfileData>('/dealers/profile/me');
        console.log('Topbar profile data:', profileData);

        setDealerName(profileData.dealer?.name || '');
        setDealerEmail(
          profileData.dealer?.contactEmail || profileData.email || '',
        );

        // Extract tier name from dealerTierCredits[0].tier
        const tierData = profileData.dealer?.dealerTierCredits?.[0]?.tier;
        setTierName(tierData?.name || 'No Tier');
      } catch (error) {
        console.error('Failed to fetch dealer topbar data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [shouldShowTopbar]);

  if (!shouldShowTopbar) {
    return null;
  }

  return (
    <DealerTopbar
      tierName={tierName}
      credits={credits}
      dealerName={dealerName}
      dealerEmail={dealerEmail}
      loading={loading}
    />
  );
};

export default DealerTopbarWrapper;
