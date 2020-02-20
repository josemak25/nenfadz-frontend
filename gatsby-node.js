/**
 * Implement Gatsby's Node APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/node-apis/
 */

// You can delete this file if you're not using it

const path = require('path');
const fs = require('fs');
const axios = require('axios');

exports.onPreInit = ({ reporter }) => {
  const postPath = path.resolve(`src/pages/posts/`);
  fs.readdir(postPath, async (error, folder) => {
    if (error) {
      return reporter.panicOnBuild(`Error while reading file path.`);
    }

    try {
      const DOCS_API = 'https://docs.google.com/uc?export=download&id=';
      const END_POINT = `${DOCS_API}1LC8gO9bkaqRX_kPH_ItmNkSN_FTAIBFe`;

      // this timestamp is the timestamp returned from the database for each post when it was created
      // remove this line on production
      const timestamp = Math.round(new Date().getTime() / 1000);
      const { data } = await axios.get(END_POINT);

      fs.writeFile(`${postPath}/${timestamp}.md`, data, 'utf8', error => {
        if (error) {
          reporter.panicOnBuild(`Error writing posts to posts folder.`);
        }
      });
    } catch (error) {
      reporter.panicOnBuild(`Error while fetching all markdown files.`);
    }
  });
};

exports.createPages = async ({ actions, graphql, reporter }) => {
  const { createPage } = actions;
  const postTemplate = path.resolve(`src/templates/post.js`);

  const result = await graphql(`
    {
      allMarkdownRemark {
        edges {
          node {
            html
            id
            frontmatter {
              path
              title
            }
          }
        }
      }
    }
  `);

  if (result.errors) {
    return reporter.panicOnBuild(`Error while running GraphQL query.`);
  }

  result.data.allMarkdownRemark.edges.forEach(({ node }) => {
    createPage({
      path: node.frontmatter.path,
      component: postTemplate
    });
  });
};
