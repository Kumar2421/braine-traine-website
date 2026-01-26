import './App.css'

import * as React from 'react'

function ExportsPage({ session, navigate }) {
    const DashboardV2Page = React.lazy(() => import('./DashboardV2Page.jsx'))

    return (
        <React.Suspense fallback={null}>
            <DashboardV2Page session={session} navigate={navigate} lockedTab="exports" />
        </React.Suspense>
    )
}

export default ExportsPage
