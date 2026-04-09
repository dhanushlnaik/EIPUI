import { NextResponse } from "next/server";
import clientPromise from '@/lib/mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('test');
    
    // Fetch all sync_state documents
    const syncStates = await db
      .collection('sync_state')
      .find({})
      .sort({ lastSyncAt: -1 })
      .toArray();

    if (!syncStates || syncStates.length === 0) {
      return NextResponse.json({ 
        message: 'No sync state found',
        lastSyncAt: null 
      }, { status: 404 });
    }

    // Find the most recent lastSyncAt across all repositories
    const mostRecentSync = syncStates.reduce((latest, current) => {
      const currentTime = new Date(current.lastSyncAt).getTime();
      const latestTime = new Date(latest.lastSyncAt).getTime();
      return currentTime > latestTime ? current : latest;
    }, syncStates[0]);

    // Calculate total activities processed
    const totalActivities = syncStates.reduce((sum, state) => 
      sum + (state.activitiesProcessed || 0), 0
    );

    return NextResponse.json({
      lastSyncAt: mostRecentSync.lastSyncAt,
      totalActivities,
      repositories: syncStates.map(state => ({
        repository: state.repository,
        lastSyncAt: state.lastSyncAt,
        activitiesProcessed: state.activitiesProcessed,
        status: state.status
      }))
    });
  } catch (error: any) {
    console.error('Error fetching sync state:', error);
    return NextResponse.json({ 
      message: 'Error fetching sync state',
      error: error.message 
    }, { status: 500 });
  }
}
