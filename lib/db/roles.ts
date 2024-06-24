import { Document, ObjectId } from 'mongodb'
import { getCollection } from '../data'
import { z } from 'zod'

export const RoleSchema = z.object({
  user_id: z.coerce.number(),
  name: z.string().trim().min(1).max(30),
  prompt: z.string().trim().min(1).max(2000),
})

export type Role = z.infer<typeof RoleSchema>

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

export async function createRole(roleData: Role) {
  const validData = RoleSchema.parse(roleData)
  const roles = await getRoleCollection()
  const result = await roles.insertOne(validData)
  return result.insertedId
}

export async function updateRole(
  roleId: string,
  userId: number,
  roleData: Pick<Role, 'name' | 'prompt'>,
) {
  const validData = RoleSchema.omit({ user_id: true }).parse(roleData)
  const roles = await getRoleCollection()
  const result = await roles.updateOne(
    { _id: new ObjectId(roleId), user_id: userId },
    { $set: validData },
  )
  return result.upsertedId
}

export async function getRole(roleId: string, userId: number) {
  const objectId = new ObjectId(roleId)

  const filter = {
    _id: objectId,
    user_id: userId,
  }
  const roles = await getRoleCollection()
  return await roles.findOne(filter)
}

export async function deleteRole(roleId: string, userId: number) {
  const objectId = new ObjectId(roleId)

  const filter = {
    _id: objectId,
    user_id: userId,
  }
  const roles = await getRoleCollection()
  const result = await roles.deleteOne(filter)
  return result.deletedCount
}
