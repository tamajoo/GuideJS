module.exports = function (grunt) {
	
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		
		sass: {
			dist: {
				options: {
					sourcemap: 'auto'
				},
				files: [{
					expand: true,
					cwd: 'source/sass',
					src: ['**/*.scss'],
					dest: 'dist',
					ext: '.css'
				}]
			}
		},
		postcss: {
			options: {
				map: false,
					processors: [
						require('autoprefixer')({
						browsers: ['last 2 versions']
					})
				]
			},
			dist: {
				src: 'dist/*.css'
			}
		},
		cssmin: {
			target: {
				files: [{
					expand: true,
					cwd: 'dist',
					src: ['*.css', '!*.min.css'],
					dest: 'dist',
					ext: '.min.css'
				}]
			}
		},
		uglify: {
			build: {
				files: [{
		            expand: true,
		            cwd: 'source/js',
		            src: ['*.js', '!*.min.js'],
		            dest: 'dist',
					ext: '.min.js',
		        }]
			}
		},
		watch: {
			css: {
				files: 'source/**/*.scss',
				tasks: ['sass', 'postcss', 'cssmin']
			},
			js: {
				files: 'source/**/*.js',
				tasks: ['uglify']
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-sass');
	grunt.loadNpmTasks('grunt-postcss');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-uglify-es');
	grunt.loadNpmTasks('grunt-contrib-watch');

	grunt.registerTask('default', ['watch']);
};