'use client'

import * as React from 'react'
import * as AvatarPrimitive from '@radix-ui/react-avatar'

import { cn } from '@/lib/utils'

function initialsFromName(name: string) {
  const cleaned = (name || '').trim()
  if (!cleaned) return '?'
  return cleaned
    .split(/\s+/)
    .map((p) => p[0] ?? '')
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function Avatar({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root>) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={cn(
        'relative flex size-8 shrink-0 overflow-hidden rounded-full',
        className,
      )}
      {...props}
    />
  )
}

function AvatarImage({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn('aspect-square size-full', className)}
      {...props}
    />
  )
}

function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        'bg-muted flex size-full items-center justify-center rounded-full',
        className,
      )}
      {...props}
    />
  )
}

function UserAvatar({
  name,
  imageUrl,
  className,
  fallbackClassName,
  imageClassName,
  imageCacheKey,
}: {
  name: string
  imageUrl?: string | null
  className?: string
  fallbackClassName?: string
  imageClassName?: string
  /** Bust browser cache when the file at the same path is replaced */
  imageCacheKey?: string | null
}) {
  const initials = initialsFromName(name)
  const src =
    imageUrl && imageUrl.length > 0
      ? imageCacheKey
        ? `${imageUrl}${imageUrl.includes('?') ? '&' : '?'}v=${encodeURIComponent(imageCacheKey)}`
        : imageUrl
      : undefined

  return (
    <Avatar className={className}>
      {src ? (
        <AvatarImage src={src} alt="" className={cn('object-cover', imageClassName)} />
      ) : null}
      <AvatarFallback className={cn("font-semibold text-white", fallbackClassName)}>
        {initials}
      </AvatarFallback>
    </Avatar>
  )
}

export { Avatar, AvatarImage, AvatarFallback, UserAvatar }
