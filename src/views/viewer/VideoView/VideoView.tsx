import { throttle } from 'lodash-es'
import React, { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import { useAddVideoView, useVideo } from '@/api/hooks'
import { ChannelLink } from '@/components/ChannelLink'
import { InfiniteVideoGrid } from '@/components/InfiniteGrids'
import { ViewErrorFallback } from '@/components/ViewErrorFallback'
import { absoluteRoutes } from '@/config/routes'
import knownLicenses from '@/data/knownLicenses.json'
import { useRouterQuery } from '@/hooks/useRouterQuery'
import { AssetType, useAsset } from '@/providers/assets'
import { usePersonalDataStore } from '@/providers/personalData'
import { Button } from '@/shared/components/Button'
import { EmptyFallback } from '@/shared/components/EmptyFallback'
import { SkeletonLoader } from '@/shared/components/SkeletonLoader'
import { VideoPlayer } from '@/shared/components/VideoPlayer'
import { transitions } from '@/shared/theme'
import { SentryLogger } from '@/utils/logs'
import { formatVideoViewsAndDate } from '@/utils/video'

import {
  ChannelContainer,
  DescriptionContainer,
  DescriptionSkeletonLoader,
  InfoContainer,
  LicenseContainer,
  Meta,
  MoreVideosContainer,
  NotFoundVideoContainer,
  PlayerContainer,
  PlayerSkeletonLoader,
  PlayerWrapper,
  StyledViewWrapper,
  TitleText,
} from './VideoView.style'

export const VideoView: React.FC = () => {
  const { id } = useParams()
  const { loading, video, error } = useVideo(id ?? '', {
    onError: (error) => SentryLogger.error('Failed to load video data', 'VideoView', error),
  })
  const { addVideoView } = useAddVideoView()
  const watchedVideos = usePersonalDataStore((state) => state.watchedVideos)
  const updateWatchedVideos = usePersonalDataStore((state) => state.actions.updateWatchedVideos)

  const timestampFromQuery = Number(useRouterQuery('time'))

  const { url: mediaUrl, isLoadingAsset: isMediaLoading } = useAsset({ entity: video, assetType: AssetType.MEDIA })

  const [startTimestamp, setStartTimestamp] = useState<number>()
  useEffect(() => {
    if (startTimestamp != null) {
      return
    }
    const currentVideo = watchedVideos.find((v) => v.id === video?.id)

    setStartTimestamp(currentVideo?.__typename === 'INTERRUPTED' ? currentVideo.timestamp : 0)
  }, [watchedVideos, startTimestamp, video?.duration, video?.id])

  useEffect(() => {
    const duration = video?.duration ?? 0
    if (!timestampFromQuery || timestampFromQuery > duration) {
      return
    }
    setStartTimestamp(timestampFromQuery)
  }, [video?.duration, timestampFromQuery])

  const channelId = video?.channel.id
  const videoId = video?.id
  const categoryId = video?.category?.id

  useEffect(() => {
    if (!videoId || !channelId) {
      return
    }
    addVideoView({
      variables: {
        videoId,
        channelId,
        categoryId,
      },
    }).catch((error) => {
      SentryLogger.error('Failed to increase video views', 'VideoView', error)
    })
  }, [addVideoView, videoId, channelId, categoryId])

  // Save the video timestamp
  // disabling eslint for this line since debounce is an external fn and eslint can't figure out its args, so it will complain.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleTimeUpdate = useCallback(
    throttle((time) => {
      if (video?.id) {
        updateWatchedVideos('INTERRUPTED', video.id, time)
      }
    }, 5000),
    [video?.id]
  )

  const handleVideoEnd = useCallback(() => {
    if (video?.id) {
      handleTimeUpdate.cancel()
      updateWatchedVideos('COMPLETED', video?.id)
    }
  }, [video?.id, handleTimeUpdate, updateWatchedVideos])

  const replaceUrls = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g
    const parts: string[] | React.ReactNodeArray = text.split(urlRegex) || []
    for (let i = 1; i < parts.length; i += 2) {
      const part = parts[i] as string
      parts[i] = (
        <Button size="large" textOnly key={`description-link-${i}`} to={part}>
          {part}
        </Button>
      )
    }
    return parts
  }

  if (error) {
    return <ViewErrorFallback />
  }

  if (!loading && !video) {
    return (
      <NotFoundVideoContainer>
        <EmptyFallback
          title="Video not found"
          button={
            <Button variant="secondary" size="large" to={absoluteRoutes.viewer.index()}>
              Go back to home page
            </Button>
          }
        />
      </NotFoundVideoContainer>
    )
  }

  const foundLicense = knownLicenses.find((license) => license.code === video?.license?.code)

  return (
    <StyledViewWrapper>
      <PlayerWrapper>
        <PlayerContainer>
          {!isMediaLoading && video ? (
            <VideoPlayer
              isVideoPending={video?.mediaAvailability === 'PENDING'}
              channelId={video.channel.id}
              videoId={video.id}
              autoplay
              src={mediaUrl}
              fill
              onEnd={handleVideoEnd}
              onTimeUpdated={handleTimeUpdate}
              startTime={startTimestamp}
            />
          ) : (
            <PlayerSkeletonLoader />
          )}
        </PlayerContainer>
      </PlayerWrapper>
      <InfoContainer className={transitions.names.slide}>
        {video ? <TitleText variant="h2">{video.title}</TitleText> : <SkeletonLoader height={46} width={400} />}
        <Meta variant="subtitle1">
          {video ? (
            formatVideoViewsAndDate(video.views || null, video.createdAt, { fullViews: true })
          ) : (
            <SkeletonLoader height={18} width={200} />
          )}
        </Meta>
        <ChannelContainer>
          <ChannelLink id={video?.channel.id} />
        </ChannelContainer>
        <DescriptionContainer>
          {video ? (
            video.description?.split('\n').map((line, idx) => <p key={idx}>{replaceUrls(line)}</p>)
          ) : (
            <>
              <DescriptionSkeletonLoader width={700} />
              <DescriptionSkeletonLoader width={400} />
              <DescriptionSkeletonLoader width={800} />
              <DescriptionSkeletonLoader width={300} />
            </>
          )}
        </DescriptionContainer>
        <LicenseContainer>
          {video ? (
            <>
              License:
              {foundLicense && (
                <a href={foundLicense.url} target="_blank" rel="noopener noreferrer">
                  {foundLicense.name}
                </a>
              )}
              <p>{video.license?.customText}</p>
              {video.license?.attribution ? <p>Attribution: {video.license.attribution}</p> : null}
            </>
          ) : (
            <SkeletonLoader height={12} width={200} />
          )}
        </LicenseContainer>
        <MoreVideosContainer>
          <InfiniteVideoGrid
            title={`More from ${video?.channel.title}`}
            titleLoader
            ready={!loading}
            channelId={channelId}
            showChannel={false}
            currentlyWatchedVideoId={video?.id}
          />
        </MoreVideosContainer>
      </InfoContainer>
    </StyledViewWrapper>
  )
}
