"use server"

import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export interface Profile {
  id: number
  name: string
  knowledge_base: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export async function getProfiles(): Promise<Profile[]> {
  try {
    const profiles = await sql`
      SELECT * FROM profiles 
      ORDER BY is_active DESC, created_at DESC
    `
    return profiles as Profile[]
  } catch (error) {
    console.error("Error fetching profiles:", error)
    return []
  }
}

export async function getActiveProfile(): Promise<Profile | null> {
  try {
    const profiles = await sql`
      SELECT * FROM profiles 
      WHERE is_active = true 
      LIMIT 1
    `
    return profiles.length > 0 ? (profiles[0] as Profile) : null
  } catch (error) {
    console.error("Error fetching active profile:", error)
    return null
  }
}

export async function createProfile(name: string, knowledge_base: string): Promise<Profile> {
  try {
    const result = await sql`
      INSERT INTO profiles (name, knowledge_base, is_active)
      VALUES (${name}, ${knowledge_base}, false)
      RETURNING *
    `
    return result[0] as Profile
  } catch (error) {
    console.error("Error creating profile:", error)
    throw new Error("Failed to create profile")
  }
}

export async function updateProfile(id: number, name: string, knowledge_base: string): Promise<Profile> {
  try {
    const result = await sql`
      UPDATE profiles 
      SET name = ${name}, 
          knowledge_base = ${knowledge_base},
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `
    return result[0] as Profile
  } catch (error) {
    console.error("Error updating profile:", error)
    throw new Error("Failed to update profile")
  }
}

export async function deleteProfile(id: number): Promise<void> {
  try {
    await sql`DELETE FROM profiles WHERE id = ${id}`
  } catch (error) {
    console.error("Error deleting profile:", error)
    throw new Error("Failed to delete profile")
  }
}

export async function setActiveProfile(id: number): Promise<void> {
  try {
    // Deactivate all profiles first
    await sql`UPDATE profiles SET is_active = false`
    // Activate the selected profile
    await sql`UPDATE profiles SET is_active = true WHERE id = ${id}`
  } catch (error) {
    console.error("Error setting active profile:", error)
    throw new Error("Failed to set active profile")
  }
}
