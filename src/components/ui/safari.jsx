import React from 'react'

export function Safari({ url = '', videoSrc = '', className = '', ...props }) {
    return (
        <div className={['uiSafari', className].join(' ')} {...props}>
            <div className="uiSafari__top" aria-hidden="true">
                <div className="uiSafari__controls">
                    <span className="uiSafari__dot uiSafari__dot--red" />
                    <span className="uiSafari__dot uiSafari__dot--yellow" />
                    <span className="uiSafari__dot uiSafari__dot--green" />
                </div>
                <div className="uiSafari__address">
                    <span className="uiSafari__lock" aria-hidden="true">🔒</span>
                    <span className="uiSafari__url">{url}</span>
                </div>
                <div className="uiSafari__spacer" />
            </div>
            <div className="uiSafari__body">
                {videoSrc ? (
                    <video className="uiSafari__video" src={videoSrc} autoPlay muted loop playsInline />
                ) : (
                    <div className="uiSafari__placeholder" />
                )}
            </div>
        </div>
    )
}
