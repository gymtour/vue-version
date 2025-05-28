import type { PathParams } from 'msw'
import { HttpResponse, http } from 'msw'
import { db } from '@db/auth/db'
import type { UserOut } from '@db/auth/types'

// Handlers for auth
export const handlerAuth = [
  http.post<PathParams>('/api/auth/login', async ({ request }) => {
    try {
      const { email, password } = await request.json() as { email: string; password: string }

      const user = db.users.find(u => u.email === email && u.password === password)

      if (!user) {
        return HttpResponse.json(
          { errors: { email: ['Invalid email or password'] } },
          { status: 400 },
        )
      }

      const accessToken = db.userTokens[user.id]

      // We are duplicating user here
      const userData = { ...user }

      const userOutData = Object.fromEntries(
        Object.entries(userData)
          .filter(
            ([key, _]) => !(key === 'password' || key === 'abilityRules'),
          ),
      ) as UserOut['userData']

      const response: UserOut = {
        userAbilityRules: userData.abilityRules,
        accessToken,
        userData: userOutData,
      }

      return HttpResponse.json(response, { status: 201 })
    }
    catch (error) {
      return HttpResponse.json(
        { errors: { email: ['An error occurred during login'] } },
        { status: 400 },
      )
    }
  }),
]