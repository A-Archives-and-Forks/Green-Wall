'use client'

import { useEffect } from 'react'

import Image from 'next/image'
import { useParams } from 'next/navigation'

import { ContributionsGraph } from '~/components/ContributionsGraph'
import { ErrorMessage } from '~/components/ErrorMessage'
import { useData } from '~/DataContext'
import { useContributionQuery } from '~/hooks/useQueries'

export function UserPage() {
  const { setGraphData } = useData()

  const params = useParams()
  const username = typeof params.username === 'string' ? params.username : ''

  const {
    data: graphData,
    isLoading: loading,
    error,
    isError,
  } = useContributionQuery(username, undefined, false, {
    enabled: !!username,
  })

  useEffect(() => {
    if (graphData) {
      setGraphData(graphData)
    }
  }, [graphData, setGraphData])

  // 构造错误对象以兼容现有接口
  const errorData
    = isError
      ? {
          errorType: error.errorType,
          message: error.message,
        }
      : undefined

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-main-400">
        <Image
          priority
          alt="loading"
          height={60}
          src="/mona-loading-default.gif"
          width={60}
        />
        <span className="bg-white px-3 py-4">Loading contributions...</span>
      </div>
    )
  }

  if (graphData) {
    return (
      <div className="py-10 md:py-14">
        <div className="flex w-full overflow-x-auto py-5 md:justify-center md:py-14">
          <ContributionsGraph mockupClassName="md:shadow-2xl md:shadow-main-200" />
        </div>
      </div>
    )
  }

  if (errorData) {
    return (
      <ErrorMessage errorType={errorData.errorType} text={errorData.message} />
    )
  }

  return null
}
