import { Document } from 'mongodb'
import { getCollection } from '../data'

export type Role = {
  user_id: number
  name: string
  prompt: string
}

export type RoleTile = Pick<Role, 'name'>

export async function getRoleCollection() {
  return getCollection<Role>('roles')
}

export async function getRoles(
  userId: number,
  page: number = 1,
  limit: number = 30,
  details: boolean = false,
) {
  const skip = (page - 1) * limit

  let filter: Partial<Role>
  //   if (isAdmin() && !userId) {
  //     // Only the admin should have access to all roles.
  //     filter = {}
  //   } else if (userId) {
  filter = { user_id: userId }
  //   } else {
  //     throw new Error('Permission denied')
  //   }

  const projection: Document = { name: 1 }
  if (details) {
    projection.prompt = 1
  }

  const roles = await getRoleCollection()
  const results = roles
    .find(filter, {
      projection,
      limit,
      skip,
    })
    .toArray()

  return results
}
