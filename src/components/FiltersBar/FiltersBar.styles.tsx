import styled from '@emotion/styled'

import { Button } from '@/shared/components/Button'
import { Text } from '@/shared/components/Text'
import { SvgGlyphHide } from '@/shared/icons'
import { colors, sizes, transitions } from '@/shared/theme'

export const FilterContentContainer = styled.div`
  display: grid;
  gap: ${sizes(3)};
`

export const MobileFilterContainer = styled.div`
  display: grid;
  padding-bottom: ${sizes(6)};
  gap: ${sizes(3)};
`

export const FiltersContainer = styled.div<{ open: boolean }>`
  align-items: center;
  background-color: ${colors.gray[800]};
  display: ${({ open }) => (open ? 'flex' : 'none')};
  justify-content: space-between;
  padding: ${sizes(4)} var(--size-global-horizontal-padding);
  will-change: transform;
  transition: all ${transitions.timings.routing} ${transitions.easing};
  transform: translateY(0);
  width: 100%;
  height: 72px;
  position: absolute;

  &.filters-enter {
    overflow: hidden;
    transform: translateY(-100%);
  }

  &.filters-enter-active {
    overflow: hidden;
    transform: translateY(0);
  }

  &.filters-exit {
    overflow: hidden;
    transform: translateY(0);
  }

  &.filters-exit-active {
    overflow: hidden;
    transform: translateY(-100%);
  }
`

export const FiltersInnerContainer = styled.div`
  display: grid;
  gap: ${sizes(4)};
  grid-auto-flow: column;
  grid-auto-columns: max-content;
`

export const OtherFilterStyledText = styled(Text)`
  margin-bottom: ${sizes(2)};
  display: flex;
  align-items: center;
`

export const OtherFilterStyledIcon = styled(SvgGlyphHide)`
  margin-right: ${sizes(2)};

  & path {
    fill: currentColor;
  }
`

export const ClearAllButton = styled(Button)`
  margin-left: auto;
`
