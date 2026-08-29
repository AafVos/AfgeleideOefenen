import { Composition } from 'remotion'

import { RegelsVideo } from './RegelsVideo'
import { Som29Video } from './Som29Video'
import { SomProductVideo } from './SomProductVideo'

export function RemotionRoot() {
  return (
    <>
      <Composition
        id="SomProduct"
        component={SomProductVideo}
        durationInFrames={2940}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="Som29"
        component={Som29Video}
        durationInFrames={3050}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="SomOfProductregel"
        component={RegelsVideo}
        durationInFrames={4220}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  )
}
