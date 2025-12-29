import { useEffect } from 'react'

/**
 * SEO component for managing meta tags and page titles
 */
export function SEO({ title, description, keywords, ogImage, path }) {
  useEffect(() => {
    const baseTitle = 'BrainTrain — Desktop-first Vision AI training studio'
    const fullTitle = title ? `${title} | ${baseTitle}` : baseTitle
    const baseDescription =
      description ||
      'Build, train, and ship Vision AI — locally, reproducibly, without cloud lock-in. Desktop-first Vision AI IDE for datasets, annotation, training, evaluation, and export.'
    const siteUrl = window.location.origin
    const fullPath = path || window.location.pathname
    const fullUrl = `${siteUrl}${fullPath}`

    // Update title
    document.title = fullTitle

    // Update or create meta tags
    const updateMetaTag = (name, content, isProperty = false) => {
      const selector = isProperty ? `meta[property="${name}"]` : `meta[name="${name}"]`
      let meta = document.querySelector(selector)
      if (!meta) {
        meta = document.createElement('meta')
        if (isProperty) {
          meta.setAttribute('property', name)
        } else {
          meta.setAttribute('name', name)
        }
        document.head.appendChild(meta)
      }
      meta.setAttribute('content', content)
    }

    // Standard meta tags
    updateMetaTag('description', baseDescription)
    if (keywords) {
      updateMetaTag('keywords', keywords)
    }

    // Open Graph tags
    updateMetaTag('og:title', fullTitle, true)
    updateMetaTag('og:description', baseDescription, true)
    updateMetaTag('og:url', fullUrl, true)
    updateMetaTag('og:type', 'website', true)
    if (ogImage) {
      updateMetaTag('og:image', ogImage, true)
    } else {
      updateMetaTag('og:image', `${siteUrl}/og-image.png`, true)
    }

    // Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image')
    updateMetaTag('twitter:title', fullTitle)
    updateMetaTag('twitter:description', baseDescription)
    if (ogImage) {
      updateMetaTag('twitter:image', ogImage)
    }

    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.setAttribute('rel', 'canonical')
      document.head.appendChild(canonical)
    }
    canonical.setAttribute('href', fullUrl)
  }, [title, description, keywords, ogImage, path])

  return null
}

