'use client'
import { NextStudio } from 'next-sanity/studio'
import config from '../../../../sanity.config'
import AuthGuard from '../AuthGuard'

export default function StudioClient() {
  return (
    <AuthGuard>
      <NextStudio config={config} />
    </AuthGuard>
  )
} 