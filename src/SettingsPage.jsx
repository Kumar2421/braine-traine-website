import './App.css'

import * as React from 'react'

function SettingsPage({ session, navigate }) {
    const DashboardV2Page = React.lazy(() => import('./DashboardV2Page.jsx'))

    return (
        <React.Suspense fallback={null}>
            <DashboardV2Page session={session} navigate={navigate} lockedTab="settings" />
        </React.Suspense>
    )
}

export default SettingsPage
