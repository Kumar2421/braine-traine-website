import { supabase } from '../supabaseClient'

/**
 * API service layer for BrainTrain website
 * Handles all Supabase interactions and provides a consistent interface
 */

// Projects API
export const projectsApi = {
  /**
   * Fetch all projects for the current user
   */
  async getProjects(userId) {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error fetching projects:', error)
      return { data: null, error }
    }
  },

  /**
   * Create a new project
   */
  async createProject(userId, projectData) {
    try {
      const { data, error } = await supabase
        .from('projects')
        .insert({
          user_id: userId,
          ...projectData,
        })
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error creating project:', error)
      return { data: null, error }
    }
  },

  /**
   * Update a project
   */
  async updateProject(projectId, updates) {
    try {
      const { data, error } = await supabase
        .from('projects')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('project_id', projectId)
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error updating project:', error)
      return { data: null, error }
    }
  },

  /**
   * Delete a project
   */
  async deleteProject(projectId) {
    try {
      const { error } = await supabase.from('projects').delete().eq('project_id', projectId)

      if (error) throw error
      return { error: null }
    } catch (error) {
      console.error('Error deleting project:', error)
      return { error }
    }
  },
}

// Downloads API
export const downloadsApi = {
  /**
   * Fetch all downloads for the current user
   */
  async getDownloads(userId) {
    try {
      const { data, error } = await supabase
        .from('downloads')
        .select('*')
        .eq('user_id', userId)
        .order('downloaded_at', { ascending: false })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error fetching downloads:', error)
      return { data: null, error }
    }
  },

  /**
   * Record a download
   */
  async recordDownload(userId, downloadData) {
    try {
      const { data, error } = await supabase
        .from('downloads')
        .insert({
          user_id: userId,
          ...downloadData,
        })
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error recording download:', error)
      return { data: null, error }
    }
  },
}

// Exports API
export const exportsApi = {
  /**
   * Fetch all exports for the current user
   */
  async getExports(userId) {
    try {
      const { data, error } = await supabase
        .from('exports')
        .select('*')
        .eq('user_id', userId)
        .order('exported_at', { ascending: false })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error fetching exports:', error)
      return { data: null, error }
    }
  },

  /**
   * Record an export
   */
  async recordExport(userId, exportData) {
    try {
      const { data, error } = await supabase
        .from('exports')
        .insert({
          user_id: userId,
          ...exportData,
        })
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error recording export:', error)
      return { data: null, error }
    }
  },
}

// IDE Sync API - for syncing metadata from IDE to website
export const ideSyncApi = {
  /**
   * Sync project metadata from IDE
   */
  async syncProject(userId, ideProjectData) {
    try {
      // Check if project exists (by ide_project_id or name)
      const { data: existing } = await supabase
        .from('projects')
        .select('project_id')
        .eq('user_id', userId)
        .eq('ide_project_id', ideProjectData.ide_project_id)
        .maybeSingle()

      if (existing) {
        // Update existing project
        return await projectsApi.updateProject(existing.project_id, {
          task_type: ideProjectData.task_type,
          dataset_count: ideProjectData.dataset_count,
          last_trained_at: ideProjectData.last_trained_at,
          status: ideProjectData.status,
          ide_version: ideProjectData.ide_version,
        })
      } else {
        // Create new project
        return await projectsApi.createProject(userId, {
          name: ideProjectData.name,
          ide_project_id: ideProjectData.ide_project_id,
          task_type: ideProjectData.task_type,
          dataset_count: ideProjectData.dataset_count,
          last_trained_at: ideProjectData.last_trained_at,
          status: ideProjectData.status,
          ide_version: ideProjectData.ide_version,
        })
      }
    } catch (error) {
      console.error('Error syncing project:', error)
      return { data: null, error }
    }
  },

  /**
   * Sync download record from IDE
   */
  async syncDownload(userId, ideDownloadData) {
    return await downloadsApi.recordDownload(userId, {
      version: ideDownloadData.version,
      os: ideDownloadData.os,
      ide_version: ideDownloadData.ide_version,
      downloaded_at: ideDownloadData.downloaded_at || new Date().toISOString(),
    })
  },

  /**
   * Sync export record from IDE
   */
  async syncExport(userId, ideExportData) {
    return await exportsApi.recordExport(userId, {
      model_name: ideExportData.model_name,
      format: ideExportData.format,
      project_id: ideExportData.project_id,
      exported_at: ideExportData.exported_at || new Date().toISOString(),
    })
  },
}

// Helper function to handle API errors consistently
export function handleApiError(error, defaultMessage = 'An error occurred') {
  if (error?.message) {
    return error.message
  }
  if (typeof error === 'string') {
    return error
  }
  return defaultMessage
}

