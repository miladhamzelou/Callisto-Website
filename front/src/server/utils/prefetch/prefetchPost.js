import axios from 'axios';
import blogPosts from '../../../app/services/blogPosts';
import coinStats from '../../../app/services/coinStats';
import getTranslations from '../../getTranslations';
import preparePosts from './preparePosts';
import handleRender from '../handleRender';

const getSlug = (id, posts) => {
  const filtered = posts.filter(elem => elem.id === id);
  return filtered.length > 0 ? filtered[0].slug : '';
}

const getPost = (slug, posts) => {
  const filtered = posts.filter(elem => elem.slug === slug);
  return filtered.length > 0 ? filtered[0].id : false;
}

const getTags = (topics, tags) => {
  const postTags = [];
  for (let i = 0; i < tags.length; i++) {
    if (topics.indexOf(tags[i].id) !== -1) {
      postTags.push({
        id: tags[i].id,
        name: tags[i].name,
        slug: tags[i].slug,
      });
    }
  }
  return postTags;
}

const prepareRelated = (relatedPosts, posts) => {
  const related = [];
  for (let i = 0; i < relatedPosts.length; i++) {
    related.push({
      id: relatedPosts[i].id,
      title: relatedPosts[i].title,
      description: relatedPosts[i].excerpt,
      slug: getSlug(relatedPosts[i].id, posts),
    });
  }
  return related;
}

const preparePost = (post, baseImageUrl, posts, tags) => {
  return {
    id: post.id,
    title: post.title.rendered,
    description: post.excerpt.rendered,
    content: post.content.rendered,
    date: post.date,
    link: post.link,
    slug: post.slug,
    cover: `${baseImageUrl}/${post.better_featured_image.media_details.file}`,
    url: `https://callisto.network/blog/post/${post.slug}/`,
    relatedPosts: prepareRelated(post['jetpack-related-posts'], posts),
    topics: getTags(post.tags, tags),
    author: post._embedded.author[0].name,
  }
}

const prefetchPost = async (req, res, next) => {
  try {
    let posts, tags, btcStats, cloStats, internalData;
    try {
      posts = await blogPosts.get('posts?_embed&per_page=50');
    } catch (err) {
      posts = [];
    }
    try {
      tags = await blogPosts.get('tags');
    } catch (err) {
      tags = [];
    }
    try {
      btcStats = await coinStats.get('ticker/1/');
    } catch (e) {
      btcStats = 0;
    }
    try {
      cloStats = await coinStats.get('ticker/2757/');
    } catch (e) {
      cloStats = 0;
    }
    try {
      internalData = await axios.get(`${process.env.API_URL}home/`);
      internalData = internalData.data;
    } catch (e) {
      internalData = {
        teamMembers: [],
        miningPools: [],
        blockExplorers: [],
        wallets: [],
        exchanges: [],
      };
    }
    const preparedPosts = posts.data && posts.data.length > 0 ? preparePosts(posts.data) : posts;
    const postId = getPost(req.params.slug, preparedPosts);
    const messages = getTranslations(req.params.lang);
    if (postId) {
      const singlePost = await blogPosts.get(`posts/${postId}?_embed`);
      const baseImageUrl = 'https://news.callisto.network/wp-content/uploads';
      const initialState = {
        teamMembers: internalData.teamMembers,
        miningPools: internalData.miningPools,
        blockExplorers: internalData.blockExplorers,
        wallets: internalData.wallets,
        exchanges: internalData.exchanges,
        blogPosts: preparedPosts,
        blogTags: tags.data && tags.data.length > 0 ? tags.data : tags,
        marketStats: {
          btcPrice: btcStats.data ? btcStats.data.data.quotes.USD.price : 0,
          cloPrice: cloStats.data ? cloStats.data.data.quotes.USD.price : 0,
          volume: cloStats.data ? cloStats.data.data.quotes.USD.volume_24h : 0,
          marketCap: cloStats.data ? cloStats.data.data.quotes.USD.market_cap : 0,
        },
        singlePost: preparePost(singlePost.data, baseImageUrl, posts.data, tags.data),
        faq: [],
        tagPosts: [],
        messages,
      };

      const blogMessages = {
        title: singlePost.data.title.rendered,
        description: singlePost.data.excerpt.rendered.replace(/<(?:.|\n)*?>/gm, ''),
        image: `${baseImageUrl}/${singlePost.data.better_featured_image.media_details.file}`,
        url: `https://callisto.network/blog/post/${singlePost.data.slug}/`,
        slug: singlePost.data.slug,
      }
      handleRender(req, res, initialState, blogMessages, 'blog')
    } else {
      res.redirect('/not-found');
    }
  } catch (err) {
    next(err);
  }
}

export default prefetchPost;
