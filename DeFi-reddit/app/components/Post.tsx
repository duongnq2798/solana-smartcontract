const Post: React.FC<{
  posts: any
}> = ({ posts }) => {
  console.log(posts)
  return (
    <div className="flex w-full flex-col items-center justify-center">
      {posts.map((item: any, j: number) => (
        <div
          tabIndex={0}
          aria-label="card 1"
          className="m-7 rounded bg-white p-6 shadow focus:outline-none lg:mr-7 lg:mb-0 lg:w-4/12"
        >
          <div className="flex items-center border-b border-gray-200 pb-6">
            <img
              src="https://cdn.tuk.dev/assets/components/misc/doge-coin.png"
              alt="coin avatar"
              className="h-12 w-12 rounded-full"
            />
            <div className="flex w-full items-start justify-between">
              <div className="w-full pl-3">
                <p className="text-xl font-medium leading-5 text-gray-800 focus:outline-none">
                  {item?.account?.title}
                </p>
                <p className="pt-2 text-sm leading-normal text-gray-500 focus:outline-none">
                  36 members
                </p>
              </div>
              <div role="img" aria-label="bookmark">
                <svg
                  className="focus:outline-none"
                  width="28"
                  height="28"
                  viewBox="0 0 28 28"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M10.5001 4.66667H17.5001C18.1189 4.66667 18.7124 4.9125 19.15 5.35009C19.5876 5.78767 19.8334 6.38117 19.8334 7V23.3333L14.0001 19.8333L8.16675 23.3333V7C8.16675 6.38117 8.41258 5.78767 8.85017 5.35009C9.28775 4.9125 9.88124 4.66667 10.5001 4.66667Z"
                    stroke="#2C3E50"
                    stroke-width="1.25"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </div>
            </div>
          </div>
          <div className="px-2">
            <p className="py-4 text-sm leading-5 text-gray-600 focus:outline-none">
              {item?.account?.text}
            </p>
            <div className="flex focus:outline-none">
              {item?.account?.topics.map((topic: string, id: number) => (
                <div className="ml-3 rounded-full bg-indigo-100 py-2 px-4 text-xs leading-3 text-indigo-700">
                  #{topic}
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default Post
