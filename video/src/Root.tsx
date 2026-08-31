import { Composition } from 'remotion'

import { QUOTIENT_DUUR, QuotientVideo } from './QuotientVideo'
import { RegelsVideo } from './RegelsVideo'
import { SOM29_DUUR, Som29Video } from './Som29Video'
import { SOM30_DUUR, Som30Video } from './Som30Video'
import { SOM34_DUUR, Som34Video } from './Som34Video'
import { SomProductVideo } from './SomProductVideo'

export function RemotionRoot() {
  return (
    <>
      <Composition
        id="SomProduct"
        component={SomProductVideo}
        durationInFrames={2825}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="Som29"
        component={Som29Video}
        durationInFrames={SOM29_DUUR}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="Som30"
        component={Som30Video}
        durationInFrames={SOM30_DUUR}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="Som34"
        component={Som34Video}
        durationInFrames={SOM34_DUUR}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="Quotientregel"
        component={QuotientVideo}
        durationInFrames={QUOTIENT_DUUR}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="SomOfProductregel"
        component={RegelsVideo}
        durationInFrames={4210}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  )
}
