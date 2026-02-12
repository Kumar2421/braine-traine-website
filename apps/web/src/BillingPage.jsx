import * as React from 'react'

function BillingPage({ session, navigate }) {
    const DashboardV2Page = React.lazy(() => import('./DashboardV2Page.jsx'))

    return (
        <React.Suspense fallback={null}>
            <DashboardV2Page session={session} navigate={navigate} lockedTab="billing" />
        </React.Suspense>
    )
}

export default BillingPage
