import { Request, Response, Router } from 'express';

const router = Router();

// API Documentation endpoint
router.get('/api/docs', (req: Request, res: Response) => {
  const apiDocs = {
    openapi: '3.0.0',
    info: {
      title: 'NeuroLint API',
      version: '1.0.0',
      description: 'AI-powered code analysis and transformation API',
      contact: {
        name: 'NeuroLint Support',
        url: 'https://neurolint.com/support',
        email: 'support@neurolint.com'
      }
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:5000',
        description: 'Development server'
      }
    ],
    paths: {
      '/api/analyze': {
        post: {
          summary: 'Analyze code for issues and improvements',
          description: 'Submit code for AI-powered analysis across multiple layers',
          tags: ['Analysis'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['code'],
                  properties: {
                    code: {
                      type: 'string',
                      description: 'The source code to analyze'
                    },
                    filePath: {
                      type: 'string',
                      description: 'Optional file path for context'
                    },
                    layers: {
                      type: 'array',
                      items: {
                        type: 'integer',
                        minimum: 1,
                        maximum: 6
                      },
                      description: 'Analysis layers to run (1-6)',
                      default: [1, 2, 3, 4]
                    }
                  }
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'Analysis completed successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      layers: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            id: { type: 'integer' },
                            name: { type: 'string' },
                            status: { type: 'string', enum: ['success', 'error', 'skipped'] },
                            changes: { type: 'integer' },
                            insights: {
                              type: 'array',
                              items: {
                                type: 'object',
                                properties: {
                                  message: { type: 'string' },
                                  severity: { type: 'string', enum: ['error', 'warning', 'info'] },
                                  line: { type: 'integer' },
                                  fix: { type: 'string' }
                                }
                              }
                            }
                          }
                        }
                      },
                      performance: {
                        type: 'object',
                        properties: {
                          totalTime: { type: 'number' },
                          layerTimes: { type: 'object' }
                        }
                      }
                    }
                  }
                }
              }
            },
            '400': {
              description: 'Invalid request',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      error: { type: 'string' }
                    }
                  }
                }
              }
            },
            '401': {
              description: 'Unauthorized - Invalid API key'
            },
            '500': {
              description: 'Internal server error'
            }
          },
          security: [
            {
              bearerAuth: []
            }
          ]
        }
      },
      '/api/transform': {
        post: {
          summary: 'Transform and fix code automatically',
          description: 'Apply AI-powered transformations to fix issues and improve code quality',
          tags: ['Transformation'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['code'],
                  properties: {
                    code: {
                      type: 'string',
                      description: 'The source code to transform'
                    },
                    filePath: {
                      type: 'string',
                      description: 'Optional file path for context'
                    },
                    layers: {
                      type: 'array',
                      items: {
                        type: 'integer',
                        minimum: 1,
                        maximum: 6
                      },
                      description: 'Transformation layers to apply (1-6)',
                      default: [1, 2, 3, 4]
                    }
                  }
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'Transformation completed successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      transformed: {
                        type: 'string',
                        description: 'The transformed code'
                      },
                      layers: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            id: { type: 'integer' },
                            name: { type: 'string' },
                            status: { type: 'string' },
                            changes: { type: 'integer' }
                          }
                        }
                      },
                      performance: {
                        type: 'object',
                        properties: {
                          totalTime: { type: 'number' }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          security: [
            {
              bearerAuth: []
            }
          ]
        }
      },
      '/api/layers': {
        get: {
          summary: 'Get available analysis layers',
          description: 'Retrieve information about all available NeuroLint analysis layers',
          tags: ['Configuration'],
          responses: {
            '200': {
              description: 'Layers information retrieved successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        id: { type: 'integer' },
                        name: { type: 'string' },
                        description: { type: 'string' },
                        timeout: { type: 'integer' },
                        enabled: { type: 'boolean' }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/health': {
        get: {
          summary: 'Health check endpoint',
          description: 'Check the health and status of the NeuroLint API',
          tags: ['Health'],
          responses: {
            '200': {
              description: 'Service is healthy',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      status: { type: 'string' },
                      timestamp: { type: 'string' },
                      version: { type: 'string' },
                      services: { type: 'object' }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    tags: [
      {
        name: 'Analysis',
        description: 'Code analysis operations'
      },
      {
        name: 'Transformation',
        description: 'Code transformation operations'
      },
      {
        name: 'Configuration',
        description: 'API configuration and metadata'
      },
      {
        name: 'Health',
        description: 'Service health and monitoring'
      }
    ]
  };

  res.json(apiDocs);
});

// API usage statistics endpoint (for authenticated users)
router.get('/api/stats', (req: Request, res: Response) => {
  // This would typically require authentication
  const stats = {
    totalRequests: 1250000,
    averageResponseTime: 95,
    successRate: 99.8,
    layerUsage: {
      '1': 890000,
      '2': 850000,
      '3': 920000,
      '4': 780000,
      '5': 340000,
      '6': 280000
    },
    popularLanguages: [
      { name: 'TypeScript', percentage: 45 },
      { name: 'JavaScript', percentage: 35 },
      { name: 'React/JSX', percentage: 15 },
      { name: 'Other', percentage: 5 }
    ]
  };

  res.json(stats);
});

export { router as apiDocsRoutes };