import type { FastifyPluginAsync } from 'fastify'
import { Type } from '@sinclair/typebox'
import type { ConnectorConfig, Prisma } from '@event-engine/database'

const ConnectorBody = Type.Object({
  name: Type.String({ minLength: 1 }),
  type: Type.String({ minLength: 1 }),
  config: Type.Record(Type.String(), Type.Unknown()),
  enabled: Type.Optional(Type.Boolean()),
})

const ConnectorResponse = Type.Object({
  id: Type.String(),
  name: Type.String(),
  type: Type.String(),
  config: Type.Record(Type.String(), Type.Unknown()),
  enabled: Type.Boolean(),
  createdAt: Type.String(),
})

const ConnectorListResponse = Type.Array(ConnectorResponse)

const ErrorResponse = Type.Object({
  error: Type.String(),
  message: Type.String(),
})

const connectorRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /api/v1/connectors — list all
  fastify.get('/connectors', {
    schema: { response: { 200: ConnectorListResponse } },
  }, async () => {
    const rows = (await fastify.prisma.connectorConfig.findMany({
      orderBy: { createdAt: 'desc' },
    })) as ConnectorConfig[]
    return rows.map((r: ConnectorConfig) => ({
      ...r,
      config: r.config as Record<string, unknown>,
      createdAt: r.createdAt.toISOString(),
    }))
  })

  // POST /api/v1/connectors — create new
  fastify.post('/connectors', {
    schema: {
      body: ConnectorBody,
      response: { 201: ConnectorResponse, 409: ErrorResponse },
    },
  }, async (request, reply) => {
    const { name, type, config, enabled = true } = request.body as {
      name: string
      type: string
      config: Record<string, unknown>
      enabled?: boolean
    }
    const existing = await fastify.prisma.connectorConfig.findUnique({ where: { name } })
    if (existing) {
      return reply.code(409).send({ error: 'Conflict', message: `Connector "${name}" already exists` })
    }
    const row = (await fastify.prisma.connectorConfig.create({
      data: {
        name,
        type,
        config: config as Prisma.InputJsonObject,
        enabled,
      },
    })) as ConnectorConfig
    return reply.code(201).send({
      ...row,
      config: row.config as Record<string, unknown>,
      createdAt: row.createdAt.toISOString(),
    })
  })

  // PATCH /api/v1/connectors/:id — update (toggle enabled, update config)
  fastify.patch('/connectors/:id', {
    schema: {
      params: Type.Object({ id: Type.String() }),
      body: Type.Partial(ConnectorBody),
      response: { 200: ConnectorResponse, 404: ErrorResponse },
    },
  }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const body = request.body as Partial<{ name: string; type: string; config: Record<string, unknown>; enabled: boolean }>
    const existing = await fastify.prisma.connectorConfig.findUnique({ where: { id } })
    if (!existing) {
      return reply.code(404).send({ error: 'Not Found', message: `Connector ${id} not found` })
    }
    const updated = (await fastify.prisma.connectorConfig.update({
      where: { id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.type !== undefined && { type: body.type }),
        ...(body.config !== undefined && { config: body.config as Prisma.InputJsonObject }),
        ...(body.enabled !== undefined && { enabled: body.enabled }),
      },
    })) as ConnectorConfig
    return {
      ...updated,
      config: updated.config as Record<string, unknown>,
      createdAt: updated.createdAt.toISOString(),
    }
  })

  // DELETE /api/v1/connectors/:id
  fastify.delete('/connectors/:id', {
    schema: {
      params: Type.Object({ id: Type.String() }),
      response: { 204: Type.Null(), 404: ErrorResponse },
    },
  }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const existing = await fastify.prisma.connectorConfig.findUnique({ where: { id } })
    if (!existing) {
      return reply.code(404).send({ error: 'Not Found', message: `Connector ${id} not found` })
    }
    await fastify.prisma.connectorConfig.delete({ where: { id } })
    return reply.code(204).send()
  })
}

export default connectorRoutes
