import * as core from '@actions/core'
import { AxiosInstance } from 'axios'
import createClient from './client'
import { ZeitConfig } from '../types'

const apiPaths = {
  deployments: '/v5/now/deployments',
  projects: '/v1/projects/',
  teams: '/v1/teams',
  domains: '/v4/domains',
}

const getDeployments = (api: AxiosInstance) => async (params: any) => {
  try {
    const {
      data: {
        deployments: [lastDeployment],
      },
    } = await api.get(apiPaths.deployments, { params })
    return lastDeployment
  } catch (error) {
    core.error(`Error: ${error.message}`)
    return null
  }
}

export default (config: ZeitConfig) => {
  const { baseURL, token } = config
  const api = createClient({ baseURL, token })
  return {
    getDeployments: getDeployments(api),
  }
}
