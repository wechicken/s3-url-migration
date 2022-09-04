require('dotenv').config()

const mysql = require('mysql2/promise');
const F = require('fxjs/Strict');

const JWT_S3_BUCKET = "https://jwtbucket.s3.ap-northeast-2.amazonaws.com";
const WECODE_S3_BUCKET = "https://chicken-api-media.s3.ap-northeast-2.amazonaws.com";

const executeQuery = F.curry((conn, query) => {
  return F.go(conn.execute(query), ([rows]) => rows)
})

const findTargets = (conn) => {
  const query = `
  SELECT id, user_thumbnail FROM users
  WHERE user_thumbnail LIKE '%jwtbucket%';
  `

  return executeQuery(conn, query)
}

const convertS3Url = (entity) => {
  const { user_thumbnail } = entity

  return {
    id: entity.id,
    user_thumbnail: user_thumbnail.replace(JWT_S3_BUCKET, WECODE_S3_BUCKET),
  }
}

const updateProfileUrl = F.curry((conn, entity) => {
  const query = `
  UPDATE users
  SET user_thumbnail = '${entity.user_thumbnail}'
  WHERE id = ${entity.id}
  `

  return executeQuery(conn, query)
})


const main = async () => {
  let prodConn

  try {
    prodConn = await mysql.createConnection({
      host: process.env.WECHICKEN_HOST,
      user: process.env.WECHICKEN_USER,
      port: process.env.WECHICKEN_PORT,
      database: process.env.WECHICKEN_DATABASE,
      password: process.env.WECHICKEN_PASSWORD,
    })

    const targets = await findTargets(prodConn)

    await F.go(
      targets,
      F.map(convertS3Url),
      F.map(updateProfileUrl(prodConn))
    )

    console.log('SUCCEED')
  } catch (e) {
    console.error(e)
  } finally {
    await prodConn.end()
  }
}

main()