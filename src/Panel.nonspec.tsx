import * as React from 'react'
import { Panel, P, PanelProps } from './Panel'

// purely type checking test for now

const k: keyof PanelProps = null
const tests = (
  <React.Fragment>
    <Panel flex />
    <Panel flex={1} />
    <Panel flex={() => 1} />
    <Panel flex="2" />

    <Panel block />
    <Panel inline />
    <Panel display="flex" />
    <Panel display="block" />
    <Panel display="inline" />

    <Panel relative />
    <Panel relative={{ t: 0 }} />
    <Panel relative={() => ({ t: 0 })} />
    <Panel absolute />
    <Panel absolute={{ t: 0 }} />
    <Panel absolute={() => ({ t: 0 })} />
    <Panel fixed />
    <Panel fixed={{ t: 0 }} />
    <Panel fixed={() => ({ t: 0 })} />

    <Panel order={1} />
    <Panel order={() => 1} />
    <Panel order="1" />
    <Panel row />
    <Panel row={false} />
    <Panel row={() => false} />
    <Panel wrap />
    <Panel wrap={false} />
    <Panel wrap={() => false} />
    <Panel wrap="reverse" />
    <Panel center />
    <Panel center={false} />
    <Panel center={() => false} />
    <Panel align="start" />
    <Panel align="center" />
    <Panel justify="start" />
    <Panel justify="center" />
    <Panel alignSelf="stretch" />

    <Panel round />
    <Panel round="5" />
    <Panel round={5} />
    <Panel round={() => 5} />
    <Panel round={{ t: 5 }} />
    <Panel round={() => ({ t: 5 })} />
    <Panel round={{ lt: 5 }} />
    <Panel round={() => ({ lt: 5 })} />

    <Panel border />
    <Panel border={5} />
    <Panel border={() => 5} />
    <Panel border="5" />
    <Panel border="5 white" />
    <Panel border="white" />
    <Panel border={{ b: 5 }} />
    <Panel border={() => ({ b: 5 })} />
    <Panel border={{ b: '5 white' }} />
    <Panel border={() => ({ b: '5 white' })} />

    <Panel outline />
    <Panel outline={5} />
    <Panel outline={() => 5} />
    <Panel outline="5" />
    <Panel outline="5 white" />
    <Panel outline="white" />

    <Panel margin />
    <Panel margin={5} />
    <Panel margin={() => 5} />
    <Panel margin="5" />
    <Panel margin={{ b: 5 }} />
    <Panel margin={() => ({ b: 5 })} />
    <Panel margin={{ b: '5' }} />
    <Panel margin={() => ({ b: '5' })} />
    <Panel padding />
    <Panel padding={5} />
    <Panel padding={() => 5} />
    <Panel padding="5" />
    <Panel padding={{ b: 5 }} />
    <Panel padding={() => ({ b: 5 })} />
    <Panel padding={{ b: '5' }} />
    <Panel padding={() => ({ b: '5' })} />

    <Panel size={5} />
    <Panel size={() => 5} />
    <Panel size="5" />
    <Panel width={5} />
    <Panel width={() => 5} />
    <Panel width="5" />
    <Panel height={5} />
    <Panel height={() => 5} />
    <Panel height="5" />
    <Panel minWidth={5} />
    <Panel minWidth={() => 5} />
    <Panel minWidth="5" />
    <Panel maxWidth={5} />
    <Panel maxWidth={() => 5} />
    <Panel maxWidth="5" />
    <Panel minHeight={5} />
    <Panel minHeight={() => 5} />
    <Panel minHeight="5" />
    <Panel maxHeight={5} />
    <Panel maxHeight={() => 5} />

    <Panel background="white" />

    <Panel transition={5} />
    <Panel transition={() => 5} />
    <Panel transition={{ shadow: 5 }} />
    <Panel transition={() => ({ shadow: 5 })} />

    <Panel text={{ size: 16 }} />
    <Panel text={() => ({ size: 16 })} />

    <Panel transform={{ scale: 0.5 }} />
    <Panel transform={() => ({ scale: 0.5 })} />

    <Panel shadow="0 0 3" />
    <Panel shadow="0 0 3px" />

    <Panel elevation />
    <Panel elevation="2" />
    <Panel elevation={2} />
    <Panel elevation={() => 2} />

    <Panel opacity />
    <Panel opacity="0.5" />
    <Panel opacity={0.5} />
    <Panel opacity={() => 0.5} />

    <Panel zIndex="1" />
    <Panel zIndex={1} />
    <Panel zIndex={() => 1} />

    <Panel interactive />
    <Panel interactive={false} />
    <Panel interactive={() => false} />

    <Panel scroll />
    <Panel scroll={false} />
    <Panel scroll={() => false} />
    <Panel scroll="auto" />
    <Panel scrollX />
    <Panel scrollX={false} />
    <Panel scrollX={() => false} />
    <Panel scrollX="auto" />
    <Panel scrollY />
    <Panel scrollY={false} />
    <Panel scrollY={() => false} />
    <Panel scrollY="auto" />

    <Panel clip />
    <Panel clip={false} />
    <Panel clip={() => false} />
    <Panel clipX />
    <Panel clipX={false} />
    <Panel clipX={() => false} />
    <Panel clipY />
    <Panel clipY={false} />
    <Panel clipY={() => false} />
  </React.Fragment>
)
