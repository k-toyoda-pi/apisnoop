import { createSelector } from 'redux-bundler'
import { groupBy, keyBy, mapValues } from 'lodash'
import { calculateCoverage } from '../lib/utils.js'

export default {
  name: 'endpoints',
    getReducer: () => {
      const initialState = {}
    
      return (state = initialState, action = {}) => {
        return state
      }
    },
    selectEndpointsById: createSelector(
      'selectEndpointsResource',
      'selectQueryObject',
      (endpoints, query) => {
        if (endpoints == null) return null
        if (query.zoomed) {
          if (query.zoomed === 'endpoint') {
            endpoints = endpoints.filter(endpoint => endpoint.level === query.level && endpoint.category === query.category && endpoint.name === query.name)
            return keyBy(endpoints, '_id')
          } else if (query.zoomed === 'category') {
            endpoints = endpoints.filter(endpoint => endpoint.level === query.level && endpoint.category === query.category)
            return keyBy(endpoints, '_id')
          } else if (query.zoomed === 'level') {
            endpoints = endpoints.filter(endpoint => endpoint.level === query.level)
            return keyBy(endpoints, '_id')
          }
        }
        return keyBy(endpoints, '_id')
      }
    ),
    selectEndpointsByLevelAndCategoryAndNameAndMethod: createSelector(
      'selectEndpointsById',
      (endpointsById) => {
        var endpointsByLevel = groupBy(endpointsById, 'level')
        return mapValues(endpointsByLevel, endpointsInLevel => {
          var endpointsByCategory = groupBy(endpointsInLevel, 'category')
          return mapValues(endpointsByCategory, endpointsInCategory => {
            var endpointsByName = groupBy(endpointsInCategory, 'name')
            return mapValues(endpointsByName, endpointsInName => {
              return keyBy(endpointsInName, 'method')
            })
          })
        })
      }
    ),
    selectEndpointsWithTestCoverage: createSelector(
      'selectEndpointsById',
      (endpointsById) => {
        var endpointsByLevel = groupBy(endpointsById, 'level')
        var coverage = calculateCoverage(endpointsById)
        return Object.assign({},{coverage}, mapValues(endpointsByLevel, endpointsInLevel => {
          var endpointsByCategory = groupBy(endpointsInLevel, 'category')
          var coverage = calculateCoverage(endpointsInLevel)
          return Object.assign({}, {coverage}, mapValues(endpointsByCategory, endpointsInCategory => {
            var endpointsByName = groupBy(endpointsInCategory, 'name')
            var coverage = calculateCoverage(endpointsInCategory)
            return Object.assign({}, {coverage}, mapValues(endpointsByName, endpointsInName => {
              var methods = keyBy(endpointsInName, 'method')
              return mapValues(methods, method => {
                var coverage = method.test_tags ? method.test_tags : [] // display empty array if untested, so chart don't break.
                return Object.assign({}, {coverage}, method)
              })
            }))
          }))
        }))
      }
    )
}
