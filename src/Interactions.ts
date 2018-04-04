import * as React from 'react'

export interface Interactions {
  focus: boolean
  press: boolean | number
  hover: boolean
}

export interface InteractiveComponent<ELEM extends HTMLElement>
  extends React.Component<any, Interactions> {
  element: ELEM
}

export let hoverReactive: Set<InteractiveComponent<any>> = null
export let pressReactive: Set<InteractiveComponent<any>> = null
export let focusReactive: Set<InteractiveComponent<any>> = null

if (typeof window !== 'undefined' && typeof window.document !== 'undefined') {
  hoverReactive = new Set()
  focusReactive = new Set()
  pressReactive = new Set()

  let isFrameRequested = false
  let queue = new Map<InteractiveComponent<any>, Partial<Interactions>>()

  const addUpdate = (
    panel: InteractiveComponent<any>,
    update: Partial<Interactions>
  ) => {
    if (queue.has(panel)) {
      Object.assign(queue.get(panel), update)
    } else {
      queue.set(panel, update)
    }

    if (isFrameRequested) {
      return
    }

    isFrameRequested = true
    requestAnimationFrame(() => {
      isFrameRequested = false
      const currentQueue = queue
      queue = new Map()
      currentQueue.forEach((update, panel) => {
        if (panel.element) {
          panel.setState(update as Pick<Interactions, any>)
        } else {
          panel.state = panel.state
            ? { ...panel.state, ...update }
            : {
                focus: false,
                hover: false,
                press: false,
                ...update
              }
        }
      })
    })
  }

  const hoverBroadcast = (value) => (e: MouseEvent) => {
    for (const target of targetAndParents(e)) {
      for (const panel of hoverReactive) {
        if (panel.element === target) {
          addUpdate(panel, { hover: value })
        }
      }
    }
  }
  document.addEventListener('mouseover', hoverBroadcast(true))
  document.addEventListener('mouseout', hoverBroadcast(false))

  const focusBroadcast = (value) => (e) => {
    for (const target of targetAndParents(e)) {
      for (const panel of focusReactive) {
        if (panel.element === target) {
          addUpdate(panel, { focus: value })
        }
      }
    }
  }
  document.addEventListener('focusin', focusBroadcast(true))
  document.addEventListener('focusout', focusBroadcast(false))

  const pressBroadcast = (value) => (e) => {
    for (const panel of pressReactive) {
      if (panel.element === e.target) {
        addUpdate(panel, { press: value })
      }
    }
  }
  document.addEventListener('mousedown', pressBroadcast(1))
  document.addEventListener('mouseup', pressBroadcast(false))

  const touchBroadcast = (value) => (e) => {
    for (const panel of pressReactive) {
      if (panel.element === e.target) {
        addUpdate(panel, {
          press: value ? value * e.targetTouches[0].force : false
        })
      }
    }
  }
  document.addEventListener('touchstart', touchBroadcast(1))
  document.addEventListener('touchmove', touchBroadcast(1))
  document.addEventListener('touchend', touchBroadcast(false))
  document.addEventListener('touchcancel', touchBroadcast(false))
}

const createEventPathGetter = () => {
  if (typeof Event === 'undefined') {
    return () => [] as HTMLElement[]
  }
  const fakeEvent = new Event('click')
  if ('deepPath' in fakeEvent) {
    return (e: Event) =>
      e
        .deepPath()
        .filter(
          (n: Node) => n && 'nodeType' in n && n.nodeType === 1
        ) as HTMLElement[]
  }
  if ('path' in fakeEvent) {
    return (e: Event & { path: Node[] }) =>
      e.path.filter(
        (n: Node) => n && 'nodeType' in n && n.nodeType === 1
      ) as HTMLElement[]
  }
  return deepPath
}

function deepPath(e: Event) {
  let current = e.target as Node
  const all: HTMLElement[] = []
  while (current) {
    if (current && 'nodeType' in current && current.nodeType === 1) {
      all.unshift(current as HTMLElement)
    }
    if (current.parentElement) {
      current = current.parentElement
    } else {
      break
    }
  }
  return all
}

const targetAndParents = createEventPathGetter()
