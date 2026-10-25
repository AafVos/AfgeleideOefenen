import { Composition } from 'remotion'

import { HERSCHRIJVEN_DUUR, HerschrijvenVideo } from './HerschrijvenVideo'
import {
  KETTING_DUUR,
  KettingShort,
  MACHT_DUUR,
  MachtShort,
  PRODUCT_DUUR,
  ProductShort,
  QUOTIENT_DUUR as QUOTIENT_SHORT_DUUR,
  QuotientShort,
  WORTEL_DUUR,
  WortelShort,
} from './shorts-scenes'
import { QUOTIENT_DUUR, QuotientVideo } from './QuotientVideo'
import { RegelsVideo } from './RegelsVideo'
import { SOM29_DUUR, Som29Video } from './Som29Video'
import { SOM30_DUUR, Som30Video } from './Som30Video'
import { SOM34_DUUR, Som34Video } from './Som34Video'
import { SomProductVideo } from './SomProductVideo'
import { shortComposities } from './shorts'

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
        id="Herschrijven"
        component={HerschrijvenVideo}
        durationInFrames={HERSCHRIJVEN_DUUR}
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
      <Composition
        id="ShortMacht"
        component={MachtShort}
        durationInFrames={MACHT_DUUR}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="ShortKetting"
        component={KettingShort}
        durationInFrames={KETTING_DUUR}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="ShortProduct"
        component={ProductShort}
        durationInFrames={PRODUCT_DUUR}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="ShortQuotient"
        component={QuotientShort}
        durationInFrames={QUOTIENT_SHORT_DUUR}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="ShortWortel"
        component={WortelShort}
        durationInFrames={WORTEL_DUUR}
        fps={30}
        width={1080}
        height={1920}
      />
      {shortComposities.map((short) => (
        <Composition
          key={short.id}
          id={short.id}
          component={short.component}
          durationInFrames={short.duur}
          fps={30}
          width={1080}
          height={1920}
        />
      ))}
    </>
  )
}
