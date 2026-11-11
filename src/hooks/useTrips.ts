import { useState, useEffect } from "react";
import { Trip, DayPlan } from "@/types";
import { TripService } from "@/services/trip.service";

export function useTripsList() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchTrips = async () => {
      setLoading(true);
      try {
        const data = await TripService.getAllTrips();
        if (isMounted) setTrips(data);
      } catch (err) {
        console.error("Error fetching trips", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchTrips();
    return () => { isMounted = false; };
  }, []);

  return { trips, loading };
}

export function useActiveTrip() {
  const [activeTrip, setActiveTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchTrip = async () => {
      setLoading(true);
      try {
        const data = await TripService.getActiveTrip();
        if (isMounted) setActiveTrip(data);
      } catch (err) {
        console.error("Error fetching active trip", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchTrip();
    
    return () => { isMounted = false; };
  }, []);

  return { activeTrip, loading };
}

export function useDayPlan(dayId: string) {
  const [dayPlan, setDayPlan] = useState<DayPlan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    if (!dayId) return;

    const fetchDay = async () => {
      setLoading(true);
      try {
        const data = await TripService.getDayPlan(dayId);
        if (isMounted) setDayPlan(data);
      } catch (err) {
        console.error("Error fetching day plan", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDay();
    
    return () => { isMounted = false; };
  }, [dayId]);

  return { dayPlan, loading };
}
