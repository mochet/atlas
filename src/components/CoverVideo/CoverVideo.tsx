import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { CSSTransition } from 'react-transition-group'

import { absoluteRoutes } from '@/config/routes'
import { useAsset } from '@/hooks'
import { Placeholder, VideoPlayer } from '@/shared/components'
import { SvgPlayerPause, SvgPlayerPlay, SvgPlayerSoundOff, SvgPlayerSoundOn } from '@/shared/icons'
import { transitions } from '@/shared/theme'

import {
  Container,
  HorizontalGradientOverlay,
  InfoContainer,
  Media,
  MediaWrapper,
  PlayButton,
  PlayerContainer,
  SoundButton,
  StyledChannelLink,
  TitleContainer,
  VerticalGradientOverlay,
  Title,
  TitlePlaceholder,
  PlayerPlaceholder,
  ControlsContainer,
  ButtonsContainer,
} from './CoverVideo.style'
import { useCoverVideo } from './coverVideoData'

const VIDEO_PLAYBACK_DELAY = 1250

const CoverVideo: React.FC = () => {
  const coverVideo = useCoverVideo()

  const [videoPlaying, setVideoPlaying] = useState(false)
  const [displayControls, setDisplayControls] = useState(false)
  const [soundMuted, setSoundMuted] = useState(true)
  const { getAssetUrl } = useAsset()

  const handlePlaybackDataLoaded = () => {
    setTimeout(() => {
      setDisplayControls(true)
      setVideoPlaying(true)
    }, VIDEO_PLAYBACK_DELAY)
  }

  const handlePlayPauseClick = () => {
    setVideoPlaying(!videoPlaying)
  }

  const handleSoundToggleClick = () => {
    setSoundMuted(!soundMuted)
  }

  const handlePlay = () => {
    setVideoPlaying(true)
  }

  const handlePause = () => {
    setVideoPlaying(false)
  }

  const thumbnailPhotoUrl = getAssetUrl(
    coverVideo?.video?.thumbnailPhotoAvailability,
    coverVideo?.video?.thumbnailPhotoUrls,
    coverVideo?.video?.thumbnailPhotoDataObject
  )

  return (
    <Container>
      <MediaWrapper>
        <Media>
          <PlayerContainer>
            {coverVideo ? (
              <VideoPlayer
                fluid
                isInBackground
                muted={soundMuted}
                playing={videoPlaying}
                posterUrl={thumbnailPhotoUrl}
                onDataLoaded={handlePlaybackDataLoaded}
                onPlay={handlePlay}
                onPause={handlePause}
                src={coverVideo?.coverCutMediaUrl}
              />
            ) : (
              <PlayerPlaceholder />
            )}
          </PlayerContainer>
          {coverVideo && <HorizontalGradientOverlay />}
          <VerticalGradientOverlay />
        </Media>
      </MediaWrapper>
      <InfoContainer isLoading={!coverVideo}>
        <StyledChannelLink
          id={coverVideo?.video.channel.id}
          hideHandle
          overrideChannel={coverVideo?.video.channel}
          avatarSize="cover"
        />
        <TitleContainer>
          {coverVideo ? (
            <>
              <Link to={absoluteRoutes.viewer.video(coverVideo.video.id)}>
                <Title variant="h2">{coverVideo.coverTitle}</Title>
              </Link>
              <span>{coverVideo.coverDescription}</span>
            </>
          ) : (
            <>
              <TitlePlaceholder width={380} height={60} />
              <Placeholder width={300} height={20} bottomSpace={4} />
              <Placeholder width={200} height={20} />
            </>
          )}
        </TitleContainer>
        <ControlsContainer>
          <CSSTransition
            in={displayControls}
            timeout={parseInt(transitions.timings.loading)}
            classNames={transitions.names.fade}
            unmountOnExit
            appear
          >
            <ButtonsContainer>
              <PlayButton
                onClick={handlePlayPauseClick}
                icon={videoPlaying ? <SvgPlayerPause /> : <SvgPlayerPlay />}
                size="large"
              >
                {videoPlaying ? 'Pause' : 'Play'}
              </PlayButton>
              <SoundButton onClick={handleSoundToggleClick} size="large">
                {!soundMuted ? <SvgPlayerSoundOn /> : <SvgPlayerSoundOff />}
              </SoundButton>
            </ButtonsContainer>
          </CSSTransition>
        </ControlsContainer>
      </InfoContainer>
    </Container>
  )
}

export default CoverVideo
