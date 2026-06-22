import Link from 'next/link'

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center h-[600px] align-items-center">
            <div className="flex items-center ">
                <span className='text-9xl'>4</span>
                <img className="w-full max-w-45 -ml-4 -mr-4" src="/images/404-img.gif" alt="404 Error" />
                <span className='text-9xl'>4</span>
            </div>
            <h2 className='text-4xl'>Not Found</h2>
            <p>Could not find requested resource</p>
        </div>
    )
}