import {
  useQueries,
  useQuery,
  type UseQueryOptions,
} from '@tanstack/react-query'

import type { ApiError } from '~/lib/api-client'
import {
  fetchContributionData,
  fetchIssuesInYear,
  fetchReposInYear,
  queryKeys,
} from '~/services/api'
import type {
  ContributionYear,
  GitHubUsername,
  GraphData,
  IssuesInYear,
  RepoCreatedInYear,
} from '~/types'

export function useContributionQuery(
  username: GitHubUsername,
  years?: ContributionYear[],
  statistics = false,
  options?: Omit<UseQueryOptions<GraphData, ApiError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: queryKeys.contribution(username, years, statistics),
    queryFn: () => fetchContributionData(username, years, statistics),
    enabled: !!username,
    ...options,
  })
}

export function useReposQuery(
  username: GitHubUsername,
  year: ContributionYear,
  options?: Omit<
    UseQueryOptions<RepoCreatedInYear, ApiError>,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery({
    queryKey: queryKeys.repos(username, year),
    queryFn: () => fetchReposInYear(username, year),
    enabled: !!username && !!year,
    ...options,
  })
}

export function useIssuesQuery(
  username: GitHubUsername,
  year: ContributionYear,
  options?: Omit<
    UseQueryOptions<IssuesInYear, ApiError>,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery({
    queryKey: queryKeys.issues(username, year),
    queryFn: () => fetchIssuesInYear(username, year),
    enabled: !!username && !!year,
    ...options,
  })
}

/**
 * 组合查询 Hook - 并行获取用户的多种数据
 */
export function useUserDataQueries(
  username: GitHubUsername,
  year?: ContributionYear,
  options?: {
    contribution?: Omit<
      UseQueryOptions<GraphData, ApiError>,
      'queryKey' | 'queryFn'
    >
    repos?: Omit<
      UseQueryOptions<RepoCreatedInYear, ApiError>,
      'queryKey' | 'queryFn'
    >
    issues?: Omit<
      UseQueryOptions<IssuesInYear, ApiError>,
      'queryKey' | 'queryFn'
    >
  },
) {
  const queries = []

  queries.push({
    queryKey: queryKeys.contribution(username, year ? [year] : undefined),
    queryFn: () => fetchContributionData(username, year ? [year] : undefined),
    enabled: !!username,
    ...options?.contribution,
  })

  // 如果指定了年份，添加仓库和问题查询
  if (year) {
    queries.push({
      queryKey: queryKeys.repos(username, year),
      queryFn: () => fetchReposInYear(username, year),
      enabled: !!username,
      ...options?.repos,
    })

    queries.push({
      queryKey: queryKeys.issues(username, year),
      queryFn: () => fetchIssuesInYear(username, year),
      enabled: !!username,
      ...options?.issues,
    })
  }

  const results = useQueries({ queries })

  return {
    contribution: results[0],
    repos: year ? results[1] : undefined,
    issues: year ? results[2] : undefined,
    // 便捷的状态聚合
    isLoading: results.some((result) => result.isLoading),
    isError: results.some((result) => result.isError),
    errors: results
      .filter((result) => result.error)
      .map((result) => result.error),
  }
}
