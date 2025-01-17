import styled from '@emotion/styled'
import { Meta, Story } from '@storybook/react'
import React from 'react'

import { Text } from '@/shared/components/Text'
import { colors } from '@/shared/theme'

import * as icons from '.'

export default {
  title: 'Shared/I/Icons',
} as Meta

const Template: Story = () => (
  <Container>
    {Object.entries(icons).map(([iconName, Component]) => {
      return (
        <Item key={iconName}>
          <Component width="48px" height="48px" />
          <Text secondary variant="caption">
            {iconName}
          </Text>
        </Item>
      )
    })}
  </Container>
)

export const Default = Template.bind({})
Default.args = {}

const Container = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, max-content));
  flex-wrap: wrap;
  padding: 50px 0;
  justify-content: center;
`

const Item = styled.div`
  border: 1px solid ${colors.gray[700]};
  flex: 1;
  padding: 32px 0;
  text-align: center;

  svg {
    margin: 0 auto;
    margin-bottom: 8px;
  }
`
