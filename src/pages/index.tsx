/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { GetStaticProps } from 'next';
import Head from 'next/head';
import { FiCalendar, FiUser } from 'react-icons/fi';
import Prismic from '@prismicio/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Link from 'next/link';
import { useState } from 'react';
import ApiSearchResponse from '@prismicio/client/types/ApiSearchResponse';
import { useRouter } from 'next/router';
import { getPrismicClient } from '../services/prismic';

import styles from './home.module.scss';
import Header from '../components/Header';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
  preview: boolean;
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default function Home({ postsPagination, preview }: HomeProps) {
  const router = useRouter();

  const handleExitPreview = () => {
    router.push('/api/exit-preview');
  };
  const formattedPosts = postsPagination.results.map(post => {
    return {
      ...post,
      first_publication_date: format(
        new Date(post.first_publication_date),
        'dd MMM yyyy',
        {
          locale: ptBR,
        }
      ),
    };
  });

  const [nextPage, setNextPage] = useState(postsPagination.next_page);
  const [posts, setPosts] = useState<Post[]>(formattedPosts);

  async function loadMorePosts() {
    if (nextPage === null) {
      return;
    }
    const response = await fetch(nextPage);
    const data: ApiSearchResponse = await response.json();

    const newPosts = data.results.map(post => {
      // Checar problema com data

      return {
        uid: post.uid,
        first_publication_date: new Date(
          post.last_publication_date
        ).toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        }),

        data: {
          title: post.data.title,
          subtitle: post.data.subtitle,
          author: post.data.author,
        },
      };
    });

    setNextPage(data.next_page);
    setPosts([...posts, ...newPosts]);
  }

  return (
    <>
      <Head>
        <title>Home | Teste React Desafio</title>
      </Head>
      <div className={styles.container}>
        <main className={styles.contentContainer}>
          <Header />
          <div className={styles.posts}>
            {postsPagination &&
              posts.map(post => (
                <Link href={`/post/${post.uid}`} key={post.uid}>
                  <a>
                    <strong>{post.data.title}</strong>
                    <p>{post.data.subtitle}</p>
                    <div className={styles.footerPost}>
                      <div className={styles.footerItem}>
                        <FiCalendar />
                        <time>{post.first_publication_date}</time>
                      </div>
                      <div className={styles.footerItem}>
                        <FiUser />
                        <time>{post.data.author}</time>
                      </div>
                    </div>
                  </a>
                </Link>
              ))}
            {nextPage && (
              <button
                onClick={loadMorePosts}
                type="button"
                className={styles.loadMore}
              >
                Carregar mais posts
              </button>
            )}
          </div>

          {preview && (
            <aside>
              <button
                onClick={handleExitPreview}
                className={styles.previewButton}
                type="button"
              >
                Sair do modo Preview
              </button>
            </aside>
          )}
        </main>
      </div>
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({ preview = false }) => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      fetch: ['posts.uid', 'posts.title', 'posts.subtitle', 'posts.author'],
      pageSize: 1,
    }
  );

  const posts = postsResponse.results.map(post => {
    // Checar problema com data

    return {
      uid: post.uid,

      // first_publication_date: new Date(
      //   post.last_publication_date
      // ).toLocaleDateString('pt-BR', {
      //   day: '2-digit',
      //   month: 'long',
      //   year: 'numeric',
      // }),
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
    };
  });
  return {
    props: {
      postsPagination: {
        next_page: postsResponse.next_page,
        results: posts,
      },
      preview,
    },
  };
};
